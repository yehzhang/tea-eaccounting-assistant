import h from 'vhtml';
import Container from './Container';

function renderUpdatedConfirmation(title: string): string {
  return (
    <Container title={title}>
      <h2>✅ 已保存</h2>
      <p>您可以关闭此页面了。</p>
    </Container>
  );
}

export default renderUpdatedConfirmation;
