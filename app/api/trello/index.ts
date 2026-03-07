import { TrelloCard, ApiConfig, TrelloListEntry } from "../../types/types";
import { FetchQueue } from "../queue";

const getLists = async (config: ApiConfig): Promise<TrelloListEntry[]> => {
  const res = await FetchQueue.getInstance().fetch(`https://api.trello.com/1/boards/${config.trelloBoardId}/lists?key=${config.trelloKey}&token=${config.trelloToken}`);
  const lists = await res.json();
  return lists;
}

export const getListData = async (config: ApiConfig, listName: string): Promise<TrelloListEntry> => {
  const lists = await getLists(config);
  const list = lists.find(l => l.name === listName);
  return list;
}

export const getCards = async (config: ApiConfig, listEntry: TrelloListEntry): Promise<TrelloCard[]>=> {
  const res = await FetchQueue.getInstance().fetch(`https://api.trello.com/1/lists/${listEntry.id}/cards?key=${config.trelloKey}&token=${config.trelloToken}`);
  const cards = await res.json();
  return cards;
};