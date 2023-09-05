import React, { ChangeEvent } from 'react';
import { InlineField, Input, SecretInput } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions, MySecureJsonData } from '../types';

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions, MySecureJsonData> {}

export function ConfigEditor(props: Props) {
  const { onOptionsChange, options } = props;
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

  // const onResolutionChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   const jsonData = {
  //     ...options.jsonData,
  //     resolution: parseFloat(event.target.value),
  //   };
  //   onOptionsChange({ ...options, jsonData });
  // };

  const { jsonData, secureJsonFields } = options;
  const secureJsonData = (options.secureJsonData || {}) as MySecureJsonData;

  return (
    <div className="gf-form-group">
      <InlineField label="Dashboard URL" labelWidth={20} required>
        <Input
          onChange={onUrlChange}
          value={jsonData.dashboardUrl || ''}
          placeholder="e.g. https://dashboard.pepperdata.com"
          width={40}
        />
      </InlineField>
      <InlineField label="API Key ID" labelWidth={20} required>
        <SecretInput
          isConfigured={(secureJsonFields && secureJsonFields.apiKeyId) as boolean}
          value={secureJsonData.apiKeyId || ''}
          placeholder="secure json field (backend only)"
          width={40}
          onReset={onResetAPIKeyId}
          onChange={onAPIKeyIdChange}
        />
      </InlineField>
      <InlineField label="API Key Token" labelWidth={20} required>
        <SecretInput
          isConfigured={(secureJsonFields && secureJsonFields.apiKeyToken) as boolean}
          value={secureJsonData.apiKeyToken || ''}
          placeholder="secure json field (backend only)"
          width={40}
          onReset={onResetAPIKeyToken}
          onChange={onAPIKeyTokenChange}
        />
      </InlineField>
      {/* <InlineField label="Resolution" labelWidth={12}>
        <Input
          onChange={onResolutionChange}
          value={jsonData.resolution || ''}
          placeholder="Enter a number"
          width={40}
        />
      </InlineField> */}
    </div>
  );
}
