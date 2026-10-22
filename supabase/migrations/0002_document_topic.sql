-- Topic tag per document (e.g. hypertension), used for topic pages and retrieval evaluation.
alter table documents add column topic text not null default 'general';
create index documents_topic_idx on documents (topic);
