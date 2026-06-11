import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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

import { deleteKeyboardBuild, fetchKeyboardBuilds } from '../api/keyboardBuilds';
import type { KeyboardBuild } from '../types/keyboardBuild';
import { formatDate } from '../utils/date';

const { Title } = Typography;

export default function KeyboardBuildListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<KeyboardBuild[]>([]);
  const initialKeyboardName = searchParams.get('keyboard_name') || '';
  const initialKeycapId = searchParams.get('keycap_id') || '';
  const [search, setSearch] = useState(initialKeyboardName);
  const [keyboardNameQuery, setKeyboardNameQuery] = useState(initialKeyboardName);
  const [keycapIdQuery, setKeycapIdQuery] = useState(initialKeycapId);

  useEffect(() => {
    const keyboardName = searchParams.get('keyboard_name') || '';
    const keycapId = searchParams.get('keycap_id') || '';
    setSearch(keyboardName);
    setKeyboardNameQuery(keyboardName);
    setKeycapIdQuery(keycapId);
  }, [searchParams]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params: { keyboard_name?: string; keycap_id?: number } = {};
      if (keyboardNameQuery) params.keyboard_name = keyboardNameQuery;
      if (keycapIdQuery) params.keycap_id = Number(keycapIdQuery);
      const items = await fetchKeyboardBuilds(
        Object.keys(params).length > 0 ? params : undefined,
      );
      setData(items);
    } catch {
      messageApi.error('加载配装记录列表失败');
    } finally {
      setLoading(false);
    }
  }, [messageApi, keyboardNameQuery, keycapIdQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: number) => {
    try {
      await deleteKeyboardBuild(id);
      messageApi.success('已删除');
      loadData();
    } catch {
      messageApi.error('删除失败');
    }
  };

  const columns: ColumnsType<KeyboardBuild> = [
    { title: '键盘名称', dataIndex: 'keyboard_name', key: 'keyboard_name' },
    {
      title: '键帽',
      key: 'keycap',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span>{record.keycap_name}</span>
          <Tag color="blue" style={{ margin: 0 }}>
            {record.keycap_color_scheme}
          </Tag>
        </Space>
      ),
    },
    {
      title: '安装日期',
      dataIndex: 'install_date',
      key: 'install_date',
      width: 120,
      render: (value: string) => formatDate(value),
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
          <Link to={`/keyboard-builds/${record.id}/edit`} style={{ color: '#1677ff' }}>
            编辑
          </Link>
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
            配装记录
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/keyboard-builds/new')}
          >
            新增配装
          </Button>
        </Space>
        <Space wrap>
          <Input.Search
            placeholder="按键盘名称搜索"
            allowClear
            enterButton={<SearchOutlined />}
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);
              if (!value) {
                setKeyboardNameQuery('');
              }
            }}
            onSearch={(value) => setKeyboardNameQuery(value.trim())}
            style={{ width: 260 }}
          />
          {keycapIdQuery && (
            <Tag closable onClose={() => setKeycapIdQuery('')}>
              键帽编号: {keycapIdQuery}
            </Tag>
          )}
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
