type DataHistoryItem = {
  sender: string;
  message: any;
  messageID: string;
};

declare type PluginProps = {
  getData: () => any;
  getDataHistory: () => DataHistoryItem[];
  getSender: () => string;
  getUser: () => string;
  isMe: () => boolean;
  sendCreateMessage: (data: any, persist: boolean) => void;
  sendUpdateMessage: (data: any, id: string) => void;
  sendDeleteMessage: (id: string) => void;
};
