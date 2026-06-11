import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  Form,
  Input,
  Space,
  Spin,
  Typography,
  message,
} from 'antd';
import type { AxiosError } from 'axios';

import { createBrand, fetchBrand, updateBrand } from '../api/brands';
import type { BrandFormValues } from '../types/brand';

const { Title } = Typography;
const { TextArea } = Input;

interface ErrorResponse {
  detail?: string;
}

export default function BrandFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form] = Form.useForm<BrandFormValues>();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) return;

    const load = async () => {
      setLoading(true);
      try {
        const brand = await fetchBrand(Number(id));
        form.setFieldsValue(brand);
      } catch {
        messageApi.error('加载品牌信息失败');
        navigate('/brands');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [form, id, isEdit, messageApi, navigate]);

  const getErrorMessage = (error: unknown): string => {
    const defaultMsg = isEdit ? '更新失败' : '创建失败';
    try {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.data?.detail === '品牌名称已存在') {
        return '品牌名称已存在';
      }
    } catch {
      // ignore
    }
    return defaultMsg;
  };

  const onFinish = async (values: BrandFormValues) => {
    setSubmitting(true);
    try {
      if (isEdit && id) {
        await updateBrand(Number(id), values);
        messageApi.success('已更新');
      } else {
        await createBrand(values);
        messageApi.success('已创建');
      }
      navigate('/brands');
    } catch (error) {
      messageApi.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

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
        <Title level={3}>{isEdit ? '编辑品牌' : '新增品牌'}</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          disabled={submitting}
        >
          <Form.Item
            label="品牌名称"
            name="name"
            rules={[{ required: true, message: '请输入品牌名称' }]}
          >
            <Input placeholder="如 GMK、Cherry" />
          </Form.Item>
          <Form.Item label="产地" name="origin">
            <Input placeholder="如 德国、美国" />
          </Form.Item>
          <Form.Item label="官网链接" name="website">
            <Input placeholder="https://www.example.com" />
          </Form.Item>
          <Form.Item label="备注" name="notes">
            <TextArea rows={4} placeholder="可选备注" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {isEdit ? '保存' : '创建'}
              </Button>
              <Button onClick={() => navigate('/brands')}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </>
  );
}
