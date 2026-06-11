import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  Descriptions,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import { fetchKeycap } from '../api/keycaps';
import type { Keycap } from '../types/keycap';

const { Title } = Typography;

export default function KeycapDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [keycap, setKeycap] = useState<Keycap | null>(null);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchKeycap(Number(id));
        setKeycap(data);
      } catch {
        messageApi.error('加载键帽详情失败');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, messageApi, navigate]);

  if (loading || !keycap) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const formatDate = (dateStr: string) =>
    dayjs(dateStr).format('YYYY-MM-DD HH:mm:ss');

  return (
    <>
      {contextHolder}
      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Title level={3} style={{ margin: 0 }}>
              键帽详情
            </Title>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/')}
              >
                返回列表
              </Button>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate(`/keycaps/${keycap.id}/edit`)}
              >
                跳转编辑
              </Button>
            </Space>
          </Space>
          <Descriptions bordered column={2} size="middle">
            <Descriptions.Item label="名称" span={2}>
              {keycap.name}
            </Descriptions.Item>
            <Descriptions.Item label="品牌">
              <Tag color="blue">{keycap.brand}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="配色">
              <Tag color="purple">{keycap.color_scheme}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="材质">
              <Tag color="green">{keycap.material}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="购入价">
              {keycap.purchase_price != null
                ? `¥ ${keycap.purchase_price.toFixed(2)}`
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {keycap.notes || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {formatDate(keycap.created_at)}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {formatDate(keycap.updated_at)}
            </Descriptions.Item>
          </Descriptions>
        </Space>
      </Card>
    </>
  );
}
