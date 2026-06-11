import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Select,
  Space,
  Spin,
  Typography,
  message,
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

import {
  createKeyboardBuild,
  fetchKeyboardBuild,
  updateKeyboardBuild,
} from '../api/keyboardBuilds';
import { fetchKeycaps } from '../api/keycaps';
import type { Keycap } from '../types/keycap';
import type { KeyboardBuildFormValues } from '../types/keyboardBuild';

const { Title } = Typography;
const { TextArea } = Input;

export default function KeyboardBuildFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form] = Form.useForm<KeyboardBuildFormValues>();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [keycaps, setKeycaps] = useState<Keycap[]>([]);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const keycapsResult = await fetchKeycaps();
        setKeycaps(keycapsResult);

        if (isEdit && id) {
          const build = await fetchKeyboardBuild(Number(id));
          form.setFieldsValue({
            ...build,
            install_date: build.install_date,
          });
        } else {
          form.setFieldsValue({ install_date: dayjs().format('YYYY-MM-DD') });
        }
      } catch {
        messageApi.error(isEdit ? '加载配装记录失败' : '加载键帽列表失败');
        navigate('/keyboard-builds');
        return;
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [form, id, isEdit, messageApi, navigate]);

  const onFinish = async (values: KeyboardBuildFormValues) => {
    setSubmitting(true);
    try {
      if (isEdit && id) {
        await updateKeyboardBuild(Number(id), values);
        messageApi.success('已更新');
      } else {
        await createKeyboardBuild(values);
        messageApi.success('已创建');
      }
      navigate('/keyboard-builds');
    } catch {
      messageApi.error(isEdit ? '更新失败' : '创建失败');
    } finally {
      setSubmitting(false);
    }
  };

  const keycapOptions = keycaps.map((k) => ({
    value: k.id,
    label: `${k.name} - ${k.color_scheme}`,
  }));

  if (loading) {
    return (
      <>
        {contextHolder}
        <Card style={{ maxWidth: 640 }}>
          <Space
            direction="vertical"
            size="middle"
            style={{ width: '100%', alignItems: 'center', padding: '40px 0' }}
          >
            <Spin size="large" />
          </Space>
        </Card>
      </>
    );
  }

  return (
    <>
      {contextHolder}
      <Card style={{ maxWidth: 640 }}>
        <Title level={3}>{isEdit ? '编辑配装记录' : '新增配装记录'}</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          disabled={submitting}
        >
          <Form.Item
            label="键盘名称"
            name="keyboard_name"
            rules={[{ required: true, message: '请输入键盘名称' }]}
          >
            <Input placeholder="如 Keychron Q1、HHKB" />
          </Form.Item>
          <Form.Item
            label="键帽"
            name="keycap_id"
            rules={[{ required: true, message: '请选择键帽' }]}
          >
            <Select
              placeholder="选择键帽"
              options={keycapOptions}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item
            label="安装日期"
            name="install_date"
            rules={[{ required: true, message: '请选择安装日期' }]}
            getValueFromEvent={(date: Dayjs | null) =>
              date ? date.format('YYYY-MM-DD') : null
            }
            getValueProps={(value: string | undefined) => ({
              value: value ? dayjs(value) : undefined,
            })}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="备注" name="notes">
            <TextArea rows={4} placeholder="可选备注" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {isEdit ? '保存' : '创建'}
              </Button>
              <Button onClick={() => navigate('/keyboard-builds')}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </>
  );
}
