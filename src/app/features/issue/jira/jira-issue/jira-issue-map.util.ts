import {JiraAttachment, JiraAuthor, JiraChangelogEntry, JiraComment, JiraIssue} from './jira-issue.model';
import {
  JiraIssueOriginal,
  JiraOriginalAttachment,
  JiraOriginalAuthor,
  JiraOriginalChangelog,
  JiraOriginalComment
} from '../jira-api-responses';
import {JiraCfg} from '../jira';
import {DropPasteIcons, DropPasteInputType} from '../../../../core/drop-paste-input/drop-paste-input';
import {IssueProviderKey, SearchResultItem} from '../../issue';
import {Attachment} from '../../../attachment/attachment.model';
import {dedupeByKey} from '../../../../util/de-dupe-by-key';
import {JIRA_TYPE} from '../../issue.const';

const matchProtocolRegEx = /(^[^:]+):\/\//;

export const mapToSearchResults = (res): SearchResultItem[] => {
  const issues = dedupeByKey(res.response.sections.map(sec => sec.issues).flat(), 'key')
    .map(issue => {
      return {
        title: issue.key + ' ' + issue.summaryText,
        titleHighlighted: issue.key + ' ' + issue.summary,
        issueType: JIRA_TYPE as IssueProviderKey,
        issueData: {
          ...issue,
          summary: issue.summaryText,
          id: issue.key,
        },
      };
    });
  return issues;
};

export const mapIssuesResponse = (res, cfg: JiraCfg): JiraIssue[] => {
  return res.response.issues.map((issue) => {
    return mapIssue(issue, cfg);
  });
};

export const mapResponse = (res) => res.response;

export const mapIssueResponse = (res, cfg: JiraCfg): JiraIssue => mapIssue(res.response, cfg);

export const mapIssue = (issue: JiraIssueOriginal, cfg: JiraCfg): JiraIssue => {
  const issueCopy = Object.assign({}, issue);
  const fields = issueCopy.fields;

  return {
    key: issueCopy.key,
    id: issueCopy.id,
    components: fields.components,
    timeestimate: fields.timeestimate,
    timespent: fields.timespent,
    description: fields.description,
    summary: fields.summary,
    updated: fields.updated,
    lastUpdateFromRemote: Date.now(),
    status: fields.status,
    storyPoints: cfg.storyPointFieldId && fields[cfg.storyPointFieldId],
    attachments: fields.attachment && fields.attachment.map(mapAttachment),
    comments: fields.comment && fields.comment.comments.map(mapComments),
    changelog: mapChangelog(issueCopy.changelog),
    assignee: mapAuthor(fields.assignee),
    url: makeIssueUrl(cfg.host, issueCopy.key)
  };
};


export const makeIssueUrl = (host: string, issueKey: string): string => {
  let fullLink = host + '/browse/' + issueKey;
  if (!fullLink.match(matchProtocolRegEx)) {
    fullLink = 'https://' + fullLink;
  }
  return fullLink;
};


export const mapAuthor = (author: JiraOriginalAuthor): JiraAuthor => {
  if (author) {
    return Object.assign({}, author, {
      self: undefined,
      avatarUrls: undefined,
      avatarUrl: author.avatarUrls['48x48'],
    });
  } else {
    return null;
  }
};
export const mapAttachment = (attachment: JiraOriginalAttachment): JiraAttachment => {
  return Object.assign({}, attachment, {
    self: undefined,
    author: undefined
  });
};
export const mapComments = (comment: JiraOriginalComment): JiraComment => {
  return Object.assign({}, comment, {
    self: undefined,
    updateAuthor: undefined,
    author: mapAuthor(comment.author)
  });
};

export const mapJiraAttachmentToAttachment = (jiraAttachment: JiraAttachment): Attachment => {
  const type = mapAttachmentType(jiraAttachment.mimeType);
  return {
    id: null,
    title: jiraAttachment.filename,
    path: jiraAttachment.thumbnail || jiraAttachment.content,
    originalImgPath: jiraAttachment.content,
    type,
    icon: DropPasteIcons[type]
  };
};

export const mapChangelog = (changelog: JiraOriginalChangelog): JiraChangelogEntry[] => {
  const newChangelog = [];
  if (!changelog) {
    return [];
  }

  changelog.histories.forEach(entry => {
    entry.items.forEach(item => {
      newChangelog.push({
        author: mapAuthor(entry.author),
        created: entry.created,
        field: item.field,
        from: item.fromString,
        to: item.toString,
      });
    });
  });
  return newChangelog;
};

export const mapTransitionResponse = (res: any) => res.response.transitions;

const mapAttachmentType = (mimeType: string): DropPasteInputType => {
  switch (mimeType) {
    case 'image/gif':
    case 'image/jpeg':
    case 'image/png':
      return 'IMG';

    default:
      return 'LINK';
  }

};
