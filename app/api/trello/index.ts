import { TrelloCard, TrelloConfig, TrelloListEntry } from "../../types/types";

const getLists = async (config: TrelloConfig): Promise<TrelloListEntry[]> => {
  const res = await fetch(`https://api.trello.com/1/boards/${config.boardId}/lists?key=${config.key}&token=${config.token}`);
  const lists = await res.json();
  return lists;
}

export const getListData = async (config: TrelloConfig, listName: string): Promise<TrelloListEntry> => {
  const lists = await getLists(config);
  const list = lists.find(l => l.name === listName);
  return list;
}

export const getCards = async (config: TrelloConfig, listEntry: TrelloListEntry): Promise<TrelloCard[]>=> {
  const res = await fetch(`https://api.trello.com/1/lists/${listEntry.id}/cards?key=${config.key}&token=${config.token}`);
  const cards = await res.json();
  return cards;
};