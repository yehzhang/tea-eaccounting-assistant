import Command from './Command';

type InvalidCommand = UnknownCommand | InvalidUsage;

interface UnknownCommand {
  readonly type: 'UnknownCommand';
}

interface InvalidUsage {
  readonly type: 'InvalidUsage';
  readonly commandType: Command['type'];
  readonly reason: InvalidUsageReason;
}

export type InvalidUsageReason = 'ArgsRequired';

export default InvalidCommand;
