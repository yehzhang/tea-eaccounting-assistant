import h from 'vhtml';
import Container from './Container';

function viewInvalidFleetLootRecord(title: string): string {
  return (
    <Container title={title}>
      <h2>🤔 无分赃记录</h2>
      <p>该记录可能已删除，或无权访问。</p>
    </Container>
  );
}

export default viewInvalidFleetLootRecord;
