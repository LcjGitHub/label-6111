import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Typography,
  message,
} from 'antd';
import dayjs from 'dayjs';

import { createGroupBuy, fetchGroupBuy, updateGroupBuy } from '../api/groupbuys';
import { GROUPBUY_STATUS_OPTIONS } from '../types/groupbuy';
import type { GroupBuyFormValues } from '../types/groupbuy';

const { Title } = Typography;
const { TextArea } = Input;

export default function GroupBuyFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form] = Form.useForm<GroupBuyFormValues>();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) return;

    const load = async () => {
      setLoading(true);
      try {
        const groupbuy = await fetchGroupBuy(Number(id));
        form.setFieldsValue({
          ...groupbuy,
          end_date: groupbuy.end_date,
        });
      } catch {
        messageApi.error('加载团购信息失败');
        navigate('/groupbuys');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [form, id, isEdit, messageApi, navigate]);

  const onFinish = async (values: GroupBuyFormValues) => {
    setSubmitting(true);
    try {
      if (isEdit && id) {
        await updateGroupBuy(Number(id), values);
        messageApi.success('已更新');
      } else {
        await createGroupBuy(values);
        messageApi.success('已创建');
      }
      navigate('/groupbuys');
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
        <Title level={3}>{isEdit ? '编辑团购' : '新增团购'}</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          disabled={loading}
          initialValues={{ status: '待付款' }}
        >
          <Form.Item
            label="商品名称"
            name="product_name"
            rules={[{ required: true, message: '请输入商品名称' }]}
          >
            <Input placeholder="如 GMK Laser 团购" />
          </Form.Item>
          <Form.Item
            label="品牌"
            name="brand"
            rules={[{ required: true, message: '请输入品牌' }]}
          >
            <Input placeholder="如 GMK、SP" />
          </Form.Item>
          <Form.Item
            label="购买平台"
            name="platform"
            rules={[{ required: true, message: '请输入购买平台' }]}
          >
            <Input placeholder="如 Drop、zFrontier" />
          </Form.Item>
          <Form.Item label="预售价 (¥)" name="pre_sale_price">
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="截止日期"
            name="end_date"
            rules={[{ required: true, message: '请选择截止日期' }]}
            getValueFromEvent={(e) => {
              if (dayjs.isDayjs(e)) {
                return e.format('YYYY-MM-DD');
              }
              return e;
            }}
            getValueProps={(value) => ({
              value: value ? dayjs(value) : undefined,
            })}
          >
            <DatePicker style={{ width: '100%' }} placeholder="选择截止日期" />
          </Form.Item>
          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select options={GROUPBUY_STATUS_OPTIONS} placeholder="选择状态" />
          </Form.Item>
          <Form.Item label="备注" name="notes">
            <TextArea rows={4} placeholder="可选备注" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {isEdit ? '保存' : '创建'}
              </Button>
              <Button onClick={() => navigate('/groupbuys')}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </>
  );
}
