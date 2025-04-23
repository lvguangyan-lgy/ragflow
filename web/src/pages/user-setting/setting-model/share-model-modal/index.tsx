import { useTranslate } from '@/hooks/common-hooks';
import { useListTenantUser } from '@/hooks/user-setting-hooks';
import { Checkbox, Form, Modal, Select, Typography } from 'antd';
import { useEffect, useState } from 'react';

interface IShareModelModalProps {
  visible: boolean;
  hideModal: () => void;
  onOk: (tenantIds: string[]) => void;
  loading?: boolean;
  llmFactory: string;
  llmName?: string;
}

const { Text } = Typography;

type FieldType = {
  tenant_ids: string[];
  make_default: boolean;
};

const ShareModelModal = ({
  visible,
  hideModal,
  onOk,
  loading,
  llmFactory,
  llmName,
}: IShareModelModalProps) => {
  const { t } = useTranslate('setting');
  const [form] = Form.useForm();
  const { data: teamMembers = [] } = useListTenantUser();
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk(values.tenant_ids);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleTenantChange = (values: string[]) => {
    setSelectedTenants(values);
  };

  // Filter out the current user from the team members list
  const tenantOptions = teamMembers
    .filter((member) => member.role === 'normal')
    .map((member) => ({
      label: member.nickname || member.email,
      value: member.user_id,
    }));

  return (
    <Modal
      title={t('shareModelTitle', { name: llmFactory, model: llmName })}
      open={visible}
      onOk={handleOk}
      onCancel={hideModal}
      okButtonProps={{ loading }}
      confirmLoading={loading}
    >
      <Form
        name="share_model"
        style={{ maxWidth: 600 }}
        autoComplete="off"
        layout={'vertical'}
        form={form}
      >
        <Form.Item<FieldType>
          label={t('selectTeamMembers')}
          name="tenant_ids"
          rules={[{ required: true, message: t('selectTeamMembersMessage') }]}
        >
          <Select
            mode="multiple"
            placeholder={t('selectTeamMembers')}
            style={{ width: '100%' }}
            options={tenantOptions}
            onChange={handleTenantChange}
          />
        </Form.Item>
        <Form.Item<FieldType>
          name="make_default"
          valuePropName="checked"
        >
          <Checkbox>{t('setAsDefaultForTeam')}</Checkbox>
        </Form.Item>
        {selectedTenants.length > 0 && (
          <Text type="secondary">
            {t('shareModelDescription')}
          </Text>
        )}
      </Form>
    </Modal>
  );
};

export default ShareModelModal;