import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AutoComplete,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Select,
  Space,
  Typography,
  message,
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

import {
  createKeyboardDevice,
  fetchKeyboardDevice,
  updateKeyboardDevice,
} from '../api/keyboardDevices';
import type { KeyboardDeviceFormValues } from '../types/keyboardDevice';

const { Title } = Typography;
const { TextArea } = Input;

const LAYOUT_OPTIONS = [
  { value: '104', label: '104 配列 (全尺寸)' },
  { value: '100', label: '100 配列 (紧凑全尺寸)' },
  { value: '96', label: '96 配列' },
  { value: '87', label: '87 配列 (TKL)' },
  { value: '75', label: '75 配列' },
  { value: '65', label: '65 配列' },
  { value: '60', label: '60 配列' },
  { value: '40', label: '40 配列' },
];

const SWITCH_TYPE_OPTIONS = [
  { value: '红轴', label: '红轴 (线性轴)' },
  { value: '茶轴', label: '茶轴 (段落轴)' },
  { value: '青轴', label: '青轴 (段落轴, 有声)' },
  { value: '黑轴', label: '黑轴 (线性轴, 重克)' },
  { value: '白轴', label: '白轴 (段落轴, 重克)' },
  { value: '银轴', label: '银轴 (线性轴, 短行程)' },
  { value: '黄轴', label: '黄轴 (线性轴)' },
  { value: '静电容', label: '静电容 (非接触式)' },
];

export default function KeyboardDeviceFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form] = Form.useForm<KeyboardDeviceFormValues>();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) {
      form.setFieldsValue({ purchase_date: dayjs().format('YYYY-MM-DD') });
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const device = await fetchKeyboardDevice(Number(id));
        form.setFieldsValue(device);
      } catch {
        messageApi.error('加载键盘设备信息失败');
        navigate('/keyboard-devices');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [form, id, isEdit, messageApi, navigate]);

  const onFinish = async (values: KeyboardDeviceFormValues) => {
    setSubmitting(true);
    try {
      if (isEdit && id) {
        await updateKeyboardDevice(Number(id), values);
        messageApi.success('已更新');
      } else {
        await createKeyboardDevice(values);
        messageApi.success('已创建');
      }
      navigate('/keyboard-devices');
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
        <Title level={3}>{isEdit ? '编辑键盘设备' : '新增键盘设备'}</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          disabled={loading || submitting}
        >
          <Form.Item
            label="设备名称"
            name="name"
            rules={[{ required: true, message: '请输入设备名称' }]}
          >
            <Input placeholder="如 Keychron K2、HHKB Professional" />
          </Form.Item>
          <Form.Item
            label="配列"
            name="layout"
            rules={[{ required: true, message: '请选择配列' }]}
          >
            <Select
              placeholder="选择配列"
              options={LAYOUT_OPTIONS}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item
            label="轴体类型"
            name="switch_type"
            rules={[{ required: true, message: '请选择或输入轴体类型' }]}
          >
            <AutoComplete
              placeholder="选择轴体类型或自定义输入"
              options={SWITCH_TYPE_OPTIONS}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item
            label="购入日期"
            name="purchase_date"
            rules={[{ required: true, message: '请选择购入日期' }]}
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
              <Button onClick={() => navigate('/keyboard-devices')}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </>
  );
}
