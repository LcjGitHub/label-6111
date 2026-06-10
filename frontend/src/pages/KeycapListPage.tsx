import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Input,
  Popconfirm,
  Space,
  Table,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';

import { deleteKeycap, fetchKeycaps } from '../api/keycaps';
import type { Keycap } from '../types/keycap';

const { Title } = Typography;

export default function KeycapListPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Keycap[]>([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const items = await fetchKeycaps(query || undefined);
      setData(items);
    } catch {
      messageApi.error('加载键帽列表失败');
    } finally {
      setLoading(false);
    }
  }, [messageApi, query]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: number) => {
    try {
      await deleteKeycap(id);
      messageApi.success('已删除');
      loadData();
    } catch {
      messageApi.error('删除失败');
    }
  };

  const columns: ColumnsType<Keycap> = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '品牌', dataIndex: 'brand', key: 'brand', width: 100 },
    { title: '配色', dataIndex: 'color_scheme', key: 'color_scheme', width: 140 },
    { title: '材质', dataIndex: 'material', key: 'material', width: 80 },
    {
      title: '购入价 (¥)',
      dataIndex: 'purchase_price',
      key: 'purchase_price',
      width: 120,
      render: (value: number | null) =>
        value != null ? value.toFixed(2) : '-',
    },
    {
      title: '备注',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => navigate(`/keycaps/${record.id}/edit`)}>
            编辑
          </Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Title level={3} style={{ margin: 0 }}>
            键帽列表
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/keycaps/new')}
          >
            新增键帽
          </Button>
        </Space>
        <Input.Search
          placeholder="按配色名搜索"
          allowClear
          enterButton={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={(value) => setQuery(value.trim())}
          style={{ maxWidth: 360 }}
        />
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
        />
      </Space>
    </>
  );
}
