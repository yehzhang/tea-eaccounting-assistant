import h from 'vhtml';
import Container from './Container';

function viewIndex(title: string): string {
  return (
    <Container title={title}>
      <h2>{title}</h2>
      <p>
        We are introducing a Discord bot that makes it easier for fleets in Eve Echoes to split
        loot. The website is still under construction. Visit our{' '}
        <a href="https://github.com/yehzhang/tea-eaccounting-assistant">Github repo</a> for more
        details.
      </p>
    </Container>
  );
}

export default viewIndex;
