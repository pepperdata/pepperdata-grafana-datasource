// Copyright (C) 2023 Pepperdata Inc. - All rights reserved.
import React, { ChangeEvent, useMemo, useState } from 'react';
import {
  Button,
  IconButton,
  InlineField,
  InlineFieldRow,
  Input,
  Select,
  getTagColorsFromName,
  useTheme2,
} from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from '../datasource';
import { MyDataSourceOptions, MyQuery } from '../types';
import _ from 'lodash';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

const LABEL_WIDTH = 24;
const tagKeyLookup: Record<string, string> = {
  host: 'h',
  user: 'u',
  'job group': 'c',
  queue: 'q',
  'app type': 'apptype',
  workflow: 'w',
  job: 'j',
  'task type': 'tt',
  'server type': 'svt',
  'spark type': 'sst',
  task: 't',
  device: 'd',
  'sub-device': 'sd',
  'inserting host': 'inshost',
  compression: 'inscomp',
  'file type': 'instype',
  'scheduler start': 'ss',
  version: 'v',
  region: 'region',
  table: 'table',
  namespace: 'namespace',
};
const DEFAULT_DOWNSAMPLER = 'default(fastest)';
const downsamplers = [DEFAULT_DOWNSAMPLER, 'average', 'sum', 'maximum', 'minimum', 'area'];
const downsamplerOptions = downsamplers.map((operator) => ({ label: operator, value: operator }));

const tagUrlKeyLookup = _.invert(tagKeyLookup);
const tagOptions = _(tagKeyLookup)
  .map((value, key) => ({
    label: `${value} (${key})`,
    value,
  }))
  .sortBy('label')
  .value();

export function QueryEditor({ query, onChange, onRunQuery, datasource }: Props) {
  const [tagName, setTagName] = useState<string | null>(null);
  const [tagValue, setTagValue] = useState('');
  const theme = useTheme2();

  const debouncedOnRunQuery = useMemo(() => _.debounce(onRunQuery, 500), [onRunQuery]);

  const onQueryTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, queryText: event.target.value });
    debouncedOnRunQuery();
  };

  const onRealmChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, realm: event.target.value });
    debouncedOnRunQuery();
  };

  const onMetricChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, metric: event.target.value });
    debouncedOnRunQuery();
  };

  const onAliasChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...query, alias: event.target.value });
    debouncedOnRunQuery();
  };

  const onTagNameChange = (option: SelectableValue<string>) => {
    if (option.value) {
      setTagName(option.value);
    }
  };

  const onTagValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTagValue(event.target.value);
  };

  const onAddTag = () => {
    if (tagName) {
      onChange({ ...query, tags: { ...query.tags, [tagKeyLookup[tagName] ?? tagName]: tagValue } });
      setTagName(null);
      setTagValue('');
      debouncedOnRunQuery();
    }
  };

  const onRemoveTag = (name: string) => {
    onChange({ ...query, tags: _.omit(query.tags, name) });
    debouncedOnRunQuery();
  };

  const onDownsamplerChange = (option: SelectableValue<string>) => {
    onChange({ ...query, ...(option.value !== DEFAULT_DOWNSAMPLER && { downsampler: option.value }) });
    debouncedOnRunQuery();
  };

  const { queryText, realm, metric, tags, downsampler, alias } = query;
  const areControlsDisabled = Boolean(queryText);
  const metricDefinitionsUrl = `${datasource.options.dashboardUrl}/${realm}/metricdefinitions`;

  return (
    <div>
      <InlineField label="Realm" labelWidth={LABEL_WIDTH} required invalid={!realm} error="Realm is required">
        <Input onChange={onRealmChange} value={realm} width={30} />
      </InlineField>
      <InlineField label="Alias" labelWidth={LABEL_WIDTH}>
        <Input onChange={onAliasChange} value={alias} width={30} />
      </InlineField>
      <InlineField
        label="Query Text"
        labelWidth={LABEL_WIDTH}
        tooltip="If you know the metrics API query
        string you can paste it here, e.g. m=tasks&u=bob&downsampler=maximum. Otherwise, use the fields
        below to build your query."
      >
        <Input onChange={onQueryTextChange} value={queryText || ''} width={60} />
      </InlineField>
      <InlineField
        label="Metric name"
        labelWidth={LABEL_WIDTH}
        disabled={areControlsDisabled}
        interactive
        tooltip={
          <>
            <p>
              Metric urlname. Example: tasks, rssram. Simple operations can be performed on metrics using RPN notation.
              For example if you wanted to divide the ram per task you would do: expr(rssram tasks /).
            </p>
            <a href={metricDefinitionsUrl} target="_blank" rel="noreferrer">
              Click here
            </a>{' '}
            to see available metric names
          </>
        }
      >
        <Input onChange={onMetricChange} value={metric} width={30} placeholder="e.g. rssram" />
      </InlineField>
      <InlineField
        label="Tags"
        labelWidth={LABEL_WIDTH}
        tooltip={`Select a tag and enter a value to filter by, then click Add to apply. If the tag you need is not
          in the list, you can type it manually. Set value to "*" (no quotes) to return all series.`}
      >
        <>
          <InlineFieldRow>
            <InlineField disabled={areControlsDisabled}>
              <Select
                options={tagOptions}
                onChange={onTagNameChange}
                value={tagName}
                placeholder="Tag"
                width={30}
                allowCustomValue={true}
              />
            </InlineField>
            <InlineField disabled={areControlsDisabled}>
              <Input onChange={onTagValueChange} value={tagValue} placeholder="Tag value" width={30} />
            </InlineField>
            <InlineField disabled={areControlsDisabled}>
              <Button fill="text" onClick={onAddTag} size="md">
                Add
              </Button>
            </InlineField>
          </InlineFieldRow>
          <InlineFieldRow>
            {_.map(tags, (value, name) => (
              <div
                key={name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: `1px solid ${getTagColorsFromName(name).color}`,
                  padding: theme.spacing(0, 1),
                  fontWeight: theme.typography.fontWeightMedium,
                  fontSize: theme.typography.size.sm,
                  backgroundColor: theme.colors.background.secondary,
                  height: theme.spacing(theme.components.height.md),
                  lineHeight: theme.spacing(theme.components.height.md),
                  marginRight: theme.spacing(0.5),
                }}
              >
                <span>
                  {tagUrlKeyLookup[name] ?? name} = {value}
                </span>
                <IconButton name="times" style={{ marginLeft: 4 }} onClick={() => onRemoveTag(name)} />
              </div>
            ))}
          </InlineFieldRow>
        </>
      </InlineField>
      <InlineField label="Downsampler override" labelWidth={LABEL_WIDTH} disabled={areControlsDisabled}>
        <Select
          options={downsamplerOptions}
          onChange={onDownsamplerChange}
          value={downsampler ?? DEFAULT_DOWNSAMPLER}
          width={30}
        />
      </InlineField>
    </div>
  );
}
