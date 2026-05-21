export type KapsoWebhookPayload = {
  event: string;
  conversation_id: string;
  contact: {
    id: string;
    phone: string;
    name?: string;
  };
  message?: {
    id: string;
    text: string;
    type: "text" | "interactive" | "template";
  };
};

export type KapsoToolResponse =
  | { type: "text"; text: string }
  | { type: "buttons"; text: string; buttons: Array<{ id: string; title: string }> }
  | { type: "list"; text: string; sections: Array<{ title: string; rows: Array<{ id: string; title: string; description?: string }> }> };
