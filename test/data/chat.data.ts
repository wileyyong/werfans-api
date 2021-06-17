import { ChatType } from '../../app/domains/chat';

export = module.exports = (seed: number) => ({
  name: `fakeChatName${seed}`,
  chatType: ChatType.Private,
});
