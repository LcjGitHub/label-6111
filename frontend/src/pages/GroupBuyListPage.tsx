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
import { PlusOutlined, SearchOutlined, ShoppingCartOutlined } from '@ant-design/icons';

import { deleteGroupBuy, fetchGroupBuys } from '../api/groupbuys';
import { GROUPBUY_STATUS_OPTIONS, STATUS_COLORS } from '../types/groupbuy';
import type { GroupBuy } from '../types/groupbuy';
import { formatDate } from '../utils/date';

const { Title } = Typography;

export default function GroupBuyListPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GroupBuy[]>([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const items = await fetchGroupBuys(statusFilter, query || undefined);
      setData(items);
    } catch {
      messageApi.error('加载团购列表失败');
    } finally {
      setLoading(false);
    }
  }, [messageApi, query, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: number) => {
    try {
      await deleteGroupBuy(id);
      messageApi.success('已删除');
      loadData();
    } catch {
      messageApi.error('删除失败');
    }
  };

  const columns: ColumnsType<GroupBuy> = [
    { title: '商品名称', dataIndex: 'product_name', key: 'product_name' },
    { title: '品牌', dataIndex: 'brand', key: 'brand', width: 100 },
    { title: '购买平台', dataIndex: 'platform', key: 'platform', width: 120 },
    {
      title: '预售价 (¥)',
      dataIndex: 'pre_sale_price',
      key: 'pre_sale_price',
      width: 120,
      render: (value: number | null) =>
        value != null ? value.toFixed(2) : '-',
    },
    {
      title: '截止日期',
      dataIndex: 'end_date',
      key: 'end_date',
      width: 120,
      render: (value: string) => formatDate(value),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (value: string) => (
        <Tag color={STATUS_COLORS[value] || 'default'}>{value}</Tag>
      ),
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
          <Button
            type="link"
            onClick={() => navigate(`/groupbuys/${record.id}/edit`)}
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
            <ShoppingCartOutlined style={{ marginRight: 8 }} />
            团购预售跟踪
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/groupbuys/new')}
          >
            新增团购
          </Button>
        </Space>
        <Space>
          <Input.Search
            placeholder="按商品名称搜索"
            allowClear
            enterButton={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={(value) => setQuery(value.trim())}
            style={{ maxWidth: 360 }}
          />
          <Select
            placeholder="按状态过滤"
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 160 }}
            options={GROUPBUY_STATUS_OPTIONS}
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
