export function remarkCodeMeta() {
  return (tree: any) => {
    const walk = (node: any) => {
      if (!node || typeof node !== 'object') return;
      if (node.type === 'code' && typeof node.meta === 'string') {
        const title = node.meta.match(/title="([^"]+)"/)?.[1];
        node.data ||= {};
        node.data.hProperties ||= {};
        if (title) node.data.hProperties['data-title'] = title;
      }
      if (Array.isArray(node.children)) node.children.forEach(walk);
    };
    walk(tree);
  };
}
