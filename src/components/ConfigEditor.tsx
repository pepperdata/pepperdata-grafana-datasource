import React, { ChangeEvent, useEffect } from 'react';
import { InlineField, Input, SecretInput } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions, MySecureJsonData } from '../types';

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions, MySecureJsonData> {}

const DEFAULT_DASHBOARD_URL = 'https://dashboard.pepperdata.com';

export function ConfigEditor(props: Props) {
  const { onOptionsChange, options } = props;

  // Set default dashboardUrl on load
  useEffect(() => {
    if (!options.jsonData.dashboardUrl) {
      onOptionsChange({ ...options, jsonData: { ...options.jsonData, dashboardUrl: DEFAULT_DASHBOARD_URL } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const jsonData = {
      ...options.jsonData,
      dashboardUrl: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  // Secure field (only sent to the backend)
  const onAPIKeyIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      secureJsonData: {
        apiKeyId: event.target.value,
      },
    });
  };

  const onAPIKeyTokenChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      secureJsonData: {
        apiKeyToken: event.target.value,
      },
    });
  };

  const onResetAPIKeyId = () => {
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        apiKeyId: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        apiKeyId: '',
      },
    });
  };

  const onResetAPIKeyToken = () => {
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        apiKeyToken: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        apiKeyToken: '',
      },
    });
  };

  const { jsonData, secureJsonFields } = options;
  const secureJsonData = (options.secureJsonData || {}) as MySecureJsonData;
  const apiKeysUrl = `${jsonData.dashboardUrl}/account/apikeys`;

  return (
    <div className="gf-form-group">
      <InlineField label="Dashboard URL" labelWidth={20} required>
        <Input
          onChange={onUrlChange}
          value={jsonData.dashboardUrl}
          placeholder="e.g. https://dashboard.pepperdata.com"
          width={40}
        />
      </InlineField>
      <InlineField
        label="API Key ID"
        labelWidth={20}
        required
        interactive
        tooltip={
          <span>
            API keys can be generated here:{' '}
            <a href={apiKeysUrl} rel="noreferrer" target="_blank">
              {apiKeysUrl}
            </a>
          </span>
        }
      >
        <SecretInput
          isConfigured={(secureJsonFields && secureJsonFields.apiKeyId) as boolean}
          value={secureJsonData.apiKeyId || ''}
          width={40}
          onReset={onResetAPIKeyId}
          onChange={onAPIKeyIdChange}
        />
      </InlineField>
      <InlineField label="API Key Token" labelWidth={20} required>
        <SecretInput
          isConfigured={(secureJsonFields && secureJsonFields.apiKeyToken) as boolean}
          value={secureJsonData.apiKeyToken || ''}
          width={40}
          onReset={onResetAPIKeyToken}
          onChange={onAPIKeyTokenChange}
        />
      </InlineField>
    </div>
  );
}
