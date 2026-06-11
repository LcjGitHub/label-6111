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

import {
  deleteKeyboardDevice,
  fetchKeyboardDevices,
} from '../api/keyboardDevices';
import type { KeyboardDevice } from '../types/keyboardDevice';
import { formatDate } from '../utils/date';

const { Title } = Typography;

export default function KeyboardDeviceListPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<KeyboardDevice[]>([]);
  const [nameSearch, setNameSearch] = useState('');
  const [layoutSearch, setLayoutSearch] = useState('');
  const [switchTypeSearch, setSwitchTypeSearch] = useState('');
  const [nameQuery, setNameQuery] = useState('');
  const [layoutQuery, setLayoutQuery] = useState('');
  const [switchTypeQuery, setSwitchTypeQuery] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params: {
        name?: string;
        layout?: string;
        switch_type?: string;
      } = {};
      if (nameQuery) params.name = nameQuery;
      if (layoutQuery) params.layout = layoutQuery;
      if (switchTypeQuery) params.switch_type = switchTypeQuery;
      const items = await fetchKeyboardDevices(
        Object.keys(params).length > 0 ? params : undefined,
      );
      setData(items);
    } catch {
      messageApi.error('加载键盘设备列表失败');
    } finally {
      setLoading(false);
    }
  }, [messageApi, nameQuery, layoutQuery, switchTypeQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: number) => {
    try {
      await deleteKeyboardDevice(id);
      messageApi.success('已删除');
      loadData();
    } catch {
      messageApi.error('删除失败');
    }
  };

  const columns: ColumnsType<KeyboardDevice> = [
    { title: '设备名称', dataIndex: 'name', key: 'name' },
    { title: '配列', dataIndex: 'layout', key: 'layout', width: 100 },
    { title: '轴体类型', dataIndex: 'switch_type', key: 'switch_type', width: 120 },
    {
      title: '购入日期',
      dataIndex: 'purchase_date',
      key: 'purchase_date',
      width: 130,
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
      width: 180,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => navigate(`/keyboard-devices/${record.id}/edit`)}>
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
            键盘设备列表
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/keyboard-devices/new')}
          >
            新增键盘设备
          </Button>
        </Space>
        <Space wrap>
          <Input.Search
            placeholder="按设备名称搜索"
            allowClear
            enterButton={<SearchOutlined />}
            value={nameSearch}
            onChange={(e) => {
              const value = e.target.value;
              setNameSearch(value);
              if (!value) {
                setNameQuery('');
              }
            }}
            onSearch={(value) => setNameQuery(value.trim())}
            style={{ width: 260 }}
          />
          <Input.Search
            placeholder="按配列搜索 (如 87、60)"
            allowClear
            enterButton={<SearchOutlined />}
            value={layoutSearch}
            onChange={(e) => {
              const value = e.target.value;
              setLayoutSearch(value);
              if (!value) {
                setLayoutQuery('');
              }
            }}
            onSearch={(value) => setLayoutQuery(value.trim())}
            style={{ width: 240 }}
          />
          <Input.Search
            placeholder="按轴体类型搜索"
            allowClear
            enterButton={<SearchOutlined />}
            value={switchTypeSearch}
            onChange={(e) => {
              const value = e.target.value;
              setSwitchTypeSearch(value);
              if (!value) {
                setSwitchTypeQuery('');
              }
            }}
            onSearch={(value) => setSwitchTypeQuery(value.trim())}
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
