import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Space,
  Typography,
  message,
} from 'antd';

import { createKeycap, fetchKeycap, updateKeycap } from '../api/keycaps';
import type { KeycapFormValues } from '../types/keycap';

const { Title } = Typography;
const { TextArea } = Input;

export default function KeycapFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form] = Form.useForm<KeycapFormValues>();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) return;

    const load = async () => {
      setLoading(true);
      try {
        const keycap = await fetchKeycap(Number(id));
        form.setFieldsValue(keycap);
      } catch {
        messageApi.error('加载键帽信息失败');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [form, id, isEdit, messageApi, navigate]);

  const onFinish = async (values: KeycapFormValues) => {
    setSubmitting(true);
    try {
      if (isEdit && id) {
        await updateKeycap(Number(id), values);
        messageApi.success('已更新');
      } else {
        await createKeycap(values);
        messageApi.success('已创建');
      }
      navigate('/');
    } catch {
      messageApi.error(isEdit ? '更新失败' : '创建失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Card loading={loading} style={{ maxWidth: 640 }}>
        <Title level={3}>{isEdit ? '编辑键帽' : '新增键帽'}</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          disabled={loading}
        >
          <Form.Item
            label="名称"
            name="name"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="如 1976、Dracula" />
          </Form.Item>
          <Form.Item
            label="品牌"
            name="brand"
            rules={[{ required: true, message: '请输入品牌' }]}
          >
            <Input placeholder="如 GMK、SA" />
          </Form.Item>
          <Form.Item
            label="配色"
            name="color_scheme"
            rules={[{ required: true, message: '请输入配色名' }]}
          >
            <Input placeholder="如 Retro Rainbow" />
          </Form.Item>
          <Form.Item
            label="材质"
            name="material"
            rules={[{ required: true, message: '请输入材质' }]}
          >
            <Input placeholder="如 ABS、PBT" />
          </Form.Item>
          <Form.Item label="购入价 (¥)" name="purchase_price">
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="备注" name="notes">
            <TextArea rows={4} placeholder="可选备注" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {isEdit ? '保存' : '创建'}
              </Button>
              <Button onClick={() => navigate('/')}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </>
  );
}
