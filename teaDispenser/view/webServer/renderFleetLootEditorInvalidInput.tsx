import h from 'vhtml';
import Container from './Container';

function renderFleetLootEditorInvalidInput(title: string): string {
  return (
    <Container title={title}>
      <h2>🙇 提交时出现了问题，保存失败</h2>
      <p>请在微信，Discord，或开黑啦联系 @yz。</p>
    </Container>
  );
}

export default renderFleetLootEditorInvalidInput;
