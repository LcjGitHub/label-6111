import { Layout, Menu, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import BrandFormPage from './pages/BrandFormPage';
import BrandListPage from './pages/BrandListPage';
import GroupBuyFormPage from './pages/GroupBuyFormPage';
import GroupBuyListPage from './pages/GroupBuyListPage';
import KeyboardBuildFormPage from './pages/KeyboardBuildFormPage';
import KeyboardBuildListPage from './pages/KeyboardBuildListPage';
import KeyboardDeviceFormPage from './pages/KeyboardDeviceFormPage';
import KeyboardDeviceListPage from './pages/KeyboardDeviceListPage';
import KeycapDetailPage from './pages/KeycapDetailPage';
import KeycapFormPage from './pages/KeycapFormPage';
import KeycapListPage from './pages/KeycapListPage';
import StatsPage from './pages/StatsPage';
import WishlistFormPage from './pages/WishlistFormPage';
import WishlistListPage from './pages/WishlistListPage';

const { Header, Content } = Layout;
const { Title } = Typography;

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedKey = location.pathname.startsWith('/groupbuys')
    ? '/groupbuys'
    : location.pathname.startsWith('/keyboard-devices')
      ? '/keyboard-devices'
      : location.pathname.startsWith('/keyboard-builds')
        ? '/keyboard-builds'
        : location.pathname.startsWith('/wishlists')
          ? '/wishlists'
          : location.pathname.startsWith('/brands')
            ? '/brands'
            : location.pathname.startsWith('/stats')
              ? '/stats'
              : '/';

  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      label: '键帽收藏',
      onClick: () => navigate('/'),
    },
    {
      key: '/keyboard-devices',
      label: '键盘设备',
      onClick: () => navigate('/keyboard-devices'),
    },
    {
      key: '/keyboard-builds',
      label: '配装记录',
      onClick: () => navigate('/keyboard-builds'),
    },
    {
      key: '/groupbuys',
      label: '团购跟踪',
      onClick: () => navigate('/groupbuys'),
    },
    {
      key: '/stats',
      label: '统计',
      onClick: () => navigate('/stats'),
    },
    {
      key: '/wishlists',
      label: '心愿单',
      onClick: () => navigate('/wishlists'),
    },
    {
      key: '/brands',
      label: '品牌管理',
      onClick: () => navigate('/brands'),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          background: '#001529',
          paddingInline: 24,
        }}
      >
        <Title level={4} style={{ color: '#fff', margin: 0, flexShrink: 0 }}>
          <Link to="/" style={{ color: 'inherit' }}>
            键帽配色收藏册
          </Link>
        </Title>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={menuItems}
          disabledOverflow
          style={{ background: 'transparent', borderBottom: 'none', flex: 1, minWidth: 200 }}
        />
      </Header>
      <Content style={{ padding: 24, maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Routes>
          <Route path="/" element={<KeycapListPage />} />
          <Route path="/keycaps/new" element={<KeycapFormPage />} />
          <Route path="/keycaps/:id" element={<KeycapDetailPage />} />
          <Route path="/keycaps/:id/edit" element={<KeycapFormPage />} />
          <Route path="/keyboard-devices" element={<KeyboardDeviceListPage />} />
          <Route path="/keyboard-devices/new" element={<KeyboardDeviceFormPage />} />
          <Route path="/keyboard-devices/:id/edit" element={<KeyboardDeviceFormPage />} />
          <Route path="/keyboard-builds" element={<KeyboardBuildListPage />} />
          <Route path="/keyboard-builds/new" element={<KeyboardBuildFormPage />} />
          <Route path="/keyboard-builds/:id/edit" element={<KeyboardBuildFormPage />} />
          <Route path="/groupbuys" element={<GroupBuyListPage />} />
          <Route path="/groupbuys/new" element={<GroupBuyFormPage />} />
          <Route path="/groupbuys/:id/edit" element={<GroupBuyFormPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/wishlists" element={<WishlistListPage />} />
          <Route path="/wishlists/new" element={<WishlistFormPage />} />
          <Route path="/wishlists/:id/edit" element={<WishlistFormPage />} />
          <Route path="/brands" element={<BrandListPage />} />
          <Route path="/brands/new" element={<BrandFormPage />} />
          <Route path="/brands/:id/edit" element={<BrandFormPage />} />
        </Routes>
      </Content>
    </Layout>
  );
}
