import h from 'vhtml';
import Container from './Container';

function viewPendingFleetLootRecord(title: string): string {
  return (
    <Container title={title}>
      <h2>无参与者</h2>
      <p>请等待分赃者完成校对工作，再来填写需求。</p>
    </Container>
  );
}

export default viewPendingFleetLootRecord;
