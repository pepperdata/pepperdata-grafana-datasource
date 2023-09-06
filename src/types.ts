// Copyright (C) 2023 Pepperdata Inc. - All rights reserved.
import { DataQuery, DataSourceJsonData } from '@grafana/schema';

export interface MyQuery extends DataQuery {
  queryText?: string;
  realm?: string;
  alias?: string;
  metric?: string;
  tags?: Record<string, string>;
  downsampler?: string;
}

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  dashboardUrl?: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface MySecureJsonData {
  apiKeyId?: string;
  apiKeyToken?: string;
}
