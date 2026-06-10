import { Layout, Typography } from 'antd';
import { Link, Route, Routes } from 'react-router-dom';

import KeycapFormPage from './pages/KeycapFormPage';
import KeycapListPage from './pages/KeycapListPage';

const { Header, Content } = Layout;
const { Title } = Typography;

export default function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          background: '#001529',
        }}
      >
        <Title level={4} style={{ color: '#fff', margin: 0 }}>
          <Link to="/" style={{ color: 'inherit' }}>
            键帽配色收藏册
          </Link>
        </Title>
      </Header>
      <Content style={{ padding: 24, maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Routes>
          <Route path="/" element={<KeycapListPage />} />
          <Route path="/keycaps/new" element={<KeycapFormPage />} />
          <Route path="/keycaps/:id/edit" element={<KeycapFormPage />} />
        </Routes>
      </Content>
    </Layout>
  );
}
