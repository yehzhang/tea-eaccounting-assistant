import h from 'vhtml';
import NeedsEditorLink from '../../data/NeedsEditorLink';
import Container from './Container';

function viewNeederChooser(title: string, needsEditorLinks: readonly NeedsEditorLink[]): string {
  return (
    <Container title={title}>
      <h2>选择需求者</h2>
      <div class="py-2">
        {needsEditorLinks.map(({ needer, needsEditorUrl }) => (
          <div class="mb-2">
            <a class="btn btn-secondary" href={needsEditorUrl}>
              {needer}
            </a>
          </div>
        ))}
      </div>
    </Container>
  );
}

export default viewNeederChooser;
