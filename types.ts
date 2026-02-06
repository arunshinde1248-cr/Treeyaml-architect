
export interface ITreeNode {
  value: number;
  left?: ITreeNode | null;
  right?: ITreeNode | null;
  id: string; // Internal ID for stable React rendering and D3
}

export type TraversalType = 'inorder' | 'preorder' | 'postorder';

export interface TreeState {
  root: ITreeNode | null;
  selectedId: string | null;
  lastAction: string | null;
}
