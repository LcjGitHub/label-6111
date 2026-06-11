import { useCallback, useEffect, useState } from 'react';
import { Card, Col, Row, Space, Table, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { fetchKeycapStats } from '../api/keycaps';
import type { GroupCount, KeycapStats } from '../types/keycap';

const { Title } = Typography;

export default function StatsPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<KeycapStats>({
    total_count: 0,
    total_purchase_price: 0,
    by_brand: [],
    by_material: [],
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchKeycapStats();
      setStats(data);
    } catch {
      messageApi.error('加载统计数据失败');
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const brandColumns: ColumnsType<GroupCount> = [
    { title: '品牌', dataIndex: 'name', key: 'name' },
    { title: '数量', dataIndex: 'count', key: 'count', width: 100 },
  ];

  const materialColumns: ColumnsType<GroupCount> = [
    { title: '材质', dataIndex: 'name', key: 'name' },
    { title: '数量', dataIndex: 'count', key: 'count', width: 100 },
  ];

  return (
    <>
      {contextHolder}
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Title level={3} style={{ margin: 0 }}>
          收藏统计
        </Title>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Card loading={loading}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>键帽总数量</div>
                <div style={{ fontSize: 36, fontWeight: 600, color: '#1677ff' }}>
                  {stats.total_count}
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card loading={loading}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>购入价合计 (¥)</div>
                <div style={{ fontSize: 36, fontWeight: 600, color: '#52c41a' }}>
                  {stats.total_purchase_price.toFixed(2)}
                </div>
              </div>
            </Card>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Card title="品牌分布" loading={loading}>
              <Table
                rowKey="name"
                columns={brandColumns}
                dataSource={stats.by_brand}
                pagination={false}
                locale={{ emptyText: '暂无数据' }}
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="材质分布" loading={loading}>
              <Table
                rowKey="name"
                columns={materialColumns}
                dataSource={stats.by_material}
                pagination={false}
                locale={{ emptyText: '暂无数据' }}
              />
            </Card>
          </Col>
        </Row>
      </Space>
    </>
  );
}
