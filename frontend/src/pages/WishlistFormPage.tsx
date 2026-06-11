import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Rate,
  Space,
  Typography,
  message,
} from 'antd';

import { createWishlist, fetchWishlist, updateWishlist } from '../api/wishlists';
import type { WishlistFormValues } from '../types/wishlist';

const { Title } = Typography;
const { TextArea } = Input;

export default function WishlistFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form] = Form.useForm<WishlistFormValues>();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) return;

    const load = async () => {
      setLoading(true);
      try {
        const wishlist = await fetchWishlist(Number(id));
        form.setFieldsValue(wishlist);
      } catch {
        messageApi.error('加载心愿单信息失败');
        navigate('/wishlists');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [form, id, isEdit, messageApi, navigate]);

  const onFinish = async (values: WishlistFormValues) => {
    setSubmitting(true);
    try {
      if (isEdit && id) {
        await updateWishlist(Number(id), values);
        messageApi.success('已更新');
      } else {
        await createWishlist(values);
        messageApi.success('已创建');
      }
      navigate('/wishlists');
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
        <Title level={3}>{isEdit ? '编辑心愿' : '新增心愿'}</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          disabled={loading}
          initialValues={{ priority: 3 }}
        >
          <Form.Item
            label="名称"
            name="name"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="如 Laser、Botanical" />
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
            <Input placeholder="如 Cyan Magenta" />
          </Form.Item>
          <Form.Item label="期望购入价 (¥)" name="expected_price">
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="优先级"
            name="priority"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Rate count={5} style={{ fontSize: 24 }} />
          </Form.Item>
          <Form.Item label="备注" name="notes">
            <TextArea rows={4} placeholder="可选备注" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {isEdit ? '保存' : '创建'}
              </Button>
              <Button onClick={() => navigate('/wishlists')}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </>
  );
}
