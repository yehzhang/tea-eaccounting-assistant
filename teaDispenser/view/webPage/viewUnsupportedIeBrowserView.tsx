import h from 'vhtml';
import Container from './Container';

function viewUnsupportedIeBrowserView(title: string): string {
  return (
    <Container title={title}>
      <h2>小助手不支持 IE 10 及以下的浏览器</h2>
      <p>
        请设置系统的默认浏览器成其他主流的浏览器，或使用其他浏览器访问本页面。
      </p>
    </Container>
  );
}

export default viewUnsupportedIeBrowserView;
