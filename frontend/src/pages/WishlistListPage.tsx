import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { HeartOutlined, PlusOutlined, SearchOutlined, StarOutlined } from '@ant-design/icons';

import { convertWishlist, deleteWishlist, fetchWishlists } from '../api/wishlists';
import type { Wishlist } from '../types/wishlist';

const { Title } = Typography;

const priorityColors: Record<number, string> = {
  1: 'default',
  2: 'blue',
  3: 'cyan',
  4: 'orange',
  5: 'red',
};

function renderPriority(priority: number) {
  const stars = Array.from({ length: priority }, (_, i) => (
    <StarOutlined key={i} style={{ fontSize: 12 }} />
  ));
  return (
    <Tag color={priorityColors[priority]}>
      <Space size={2}>{stars}</Space>
    </Tag>
  );
}

export default function WishlistListPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Wishlist[]>([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<number | undefined>();
  const [convertingId, setConvertingId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const items = await fetchWishlists(query || undefined, priorityFilter);
      setData(items);
    } catch {
      messageApi.error('加载心愿单列表失败');
    } finally {
      setLoading(false);
    }
  }, [messageApi, query, priorityFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: number) => {
    try {
      await deleteWishlist(id);
      messageApi.success('已删除');
      loadData();
    } catch {
      messageApi.error('删除失败');
    }
  };

  const handleConvert = async (id: number) => {
    setConvertingId(id);
    try {
      const keycapId = await convertWishlist(id);
      messageApi.success('已转为收藏，即将跳转到键帽编辑页');
      await loadData();
      navigate(`/keycaps/${keycapId}/edit`);
    } catch {
      messageApi.error('转为收藏失败');
    } finally {
      setConvertingId(null);
    }
  };

  const columns: ColumnsType<Wishlist> = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '品牌', dataIndex: 'brand', key: 'brand', width: 100 },
    { title: '配色', dataIndex: 'color_scheme', key: 'color_scheme', width: 140 },
    {
      title: '期望购入价 (¥)',
      dataIndex: 'expected_price',
      key: 'expected_price',
      width: 140,
      render: (value: number | null) =>
        value != null ? value.toFixed(2) : '-',
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 110,
      render: (value: number) => renderPriority(value),
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
      width: 260,
      render: (_, record) => (
        <Space>
          <Popconfirm title="确定转为收藏？" onConfirm={() => handleConvert(record.id)}>
            <Button
              type="link"
              icon={<HeartOutlined />}
              loading={convertingId === record.id}
              disabled={convertingId !== null && convertingId !== record.id}
            >
              转为收藏
            </Button>
          </Popconfirm>
          <Button
            type="link"
            onClick={() => navigate(`/wishlists/${record.id}/edit`)}
          >
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
            心愿单
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/wishlists/new')}
          >
            新增心愿
          </Button>
        </Space>
        <Space>
          <Input.Search
            placeholder="按配色名搜索"
            allowClear
            enterButton={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={(value) => setQuery(value.trim())}
            style={{ maxWidth: 360 }}
          />
          <Select
            placeholder="按优先级过滤"
            allowClear
            value={priorityFilter}
            onChange={setPriorityFilter}
            style={{ width: 160 }}
            options={[
              { value: 1, label: '优先级 1' },
              { value: 2, label: '优先级 2' },
              { value: 3, label: '优先级 3' },
              { value: 4, label: '优先级 4' },
              { value: 5, label: '优先级 5' },
            ]}
          />
        </Space>
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
