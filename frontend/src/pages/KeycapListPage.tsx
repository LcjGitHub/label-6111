import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Keycap[]>([]);
  const initialBrand = searchParams.get('brand') || '';
  const [colorSchemeSearch, setColorSchemeSearch] = useState('');
  const [brandSearch, setBrandSearch] = useState(initialBrand);
  const [materialSearch, setMaterialSearch] = useState('');
  const [colorSchemeQuery, setColorSchemeQuery] = useState('');
  const [brandQuery, setBrandQuery] = useState(initialBrand);
  const [materialQuery, setMaterialQuery] = useState('');

  useEffect(() => {
    const brand = searchParams.get('brand') || '';
    setBrandSearch(brand);
    setBrandQuery(brand);
  }, [searchParams]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params: { color_scheme?: string; brand?: string; material?: string } = {};
      if (colorSchemeQuery) params.color_scheme = colorSchemeQuery;
      if (brandQuery) params.brand = brandQuery;
      if (materialQuery) params.material = materialQuery;
      const items = await fetchKeycaps(
        Object.keys(params).length > 0 ? params : undefined,
      );
      setData(items);
    } catch {
      messageApi.error('加载键帽列表失败');
    } finally {
      setLoading(false);
    }
  }, [messageApi, colorSchemeQuery, brandQuery, materialQuery]);

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
      width: 220,
      render: (_, record) => (
        <Space>
          <Link to={`/keycaps/${record.id}`} style={{ color: '#1677ff' }}>
            查看
          </Link>
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
        <Space wrap>
          <Input.Search
            placeholder="按配色名搜索"
            allowClear
            enterButton={<SearchOutlined />}
            value={colorSchemeSearch}
            onChange={(e) => {
              const value = e.target.value;
              setColorSchemeSearch(value);
              if (!value) {
                setColorSchemeQuery('');
              }
            }}
            onSearch={(value) => setColorSchemeQuery(value.trim())}
            style={{ width: 260 }}
          />
          <Input.Search
            placeholder="按品牌搜索"
            allowClear
            enterButton={<SearchOutlined />}
            value={brandSearch}
            onChange={(e) => {
              const value = e.target.value;
              setBrandSearch(value);
              if (!value) {
                setBrandQuery('');
              }
            }}
            onSearch={(value) => setBrandQuery(value.trim())}
            style={{ width: 220 }}
          />
          <Input.Search
            placeholder="按材质搜索"
            allowClear
            enterButton={<SearchOutlined />}
            value={materialSearch}
            onChange={(e) => {
              const value = e.target.value;
              setMaterialSearch(value);
              if (!value) {
                setMaterialQuery('');
              }
            }}
            onSearch={(value) => setMaterialQuery(value.trim())}
            style={{ width: 220 }}
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
