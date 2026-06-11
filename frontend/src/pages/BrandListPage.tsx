import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Input,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';

import { deleteBrand, fetchBrands } from '../api/brands';
import type { Brand } from '../types/brand';

const { Title } = Typography;

export default function BrandListPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Brand[]>([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const items = await fetchBrands(query || undefined);
      setData(items);
    } catch {
      messageApi.error('加载品牌列表失败');
    } finally {
      setLoading(false);
    }
  }, [messageApi, query]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: number) => {
    try {
      await deleteBrand(id);
      messageApi.success('已删除');
      loadData();
    } catch {
      messageApi.error('删除失败');
    }
  };

  const columns: ColumnsType<Brand> = [
    {
      title: '品牌名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '产地',
      dataIndex: 'origin',
      key: 'origin',
      width: 120,
      render: (value: string | null) => value ?? '-',
    },
    {
      title: '官网链接',
      dataIndex: 'website',
      key: 'website',
      width: 260,
      render: (value: string | null) =>
        value ? (
          <a href={value} target="_blank" rel="noopener noreferrer">
            {value}
          </a>
        ) : (
          '-'
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
            onClick={() => navigate(`/brands/${record.id}/edit`)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除？"
            onConfirm={() => handleDelete(record.id)}
          >
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
            品牌管理
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/brands/new')}
          >
            新增品牌
          </Button>
        </Space>
        <Input.Search
          placeholder="按品牌名称搜索"
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
