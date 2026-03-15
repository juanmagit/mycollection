import { ConfigStore } from "../../features/config/config-store";
import { TrelloCard, TrelloListEntry } from "../../types/types";
import { FetchQueue } from "../queue";

const getLists = async (): Promise<TrelloListEntry[]> => {
  const res = await FetchQueue.getInstance().fetch(`https://api.trello.com/1/boards/${ConfigStore.getInstance().getApiConfig().trelloBoardId}/lists?key=${ConfigStore.getInstance().getApiConfig().trelloKey}&token=${ConfigStore.getInstance().getApiConfig().trelloToken}`);
  const lists = await res.json();
  return lists;
}

export const getListData = async (listName: string): Promise<TrelloListEntry> => {
  const lists = await getLists();
  const list = lists.find(l => l.name === listName);
  return list;
}

export const getCards = async (listEntry: TrelloListEntry): Promise<TrelloCard[]>=> {
  const res = await FetchQueue.getInstance().fetch(`https://api.trello.com/1/lists/${listEntry.id}/cards?key=${ConfigStore.getInstance().getApiConfig().trelloKey}&token=${ConfigStore.getInstance().getApiConfig().trelloToken}`);
  const cards = await res.json();
  return cards;
};