'use client';

import Link from 'next/link';
import { ArrowUp, List, X } from 'lucide-react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import type { TocItem } from '@/lib/toc';

export function MobileArticleNav({ items }: { items: TocItem[] }) {
  return (
    <div className="mobile-article-nav">
      <Link href="/blog">Blog</Link>
      <Drawer>
        <DrawerTrigger className="mobile-contents-trigger">
          <List aria-hidden="true" strokeWidth={1.5} />
          Contents
        </DrawerTrigger>
        <DrawerContent className="article-drawer">
          <DrawerHeader className="article-drawer-header">
            <DrawerTitle>Contents</DrawerTitle>
            <DrawerClose className="article-drawer-close" aria-label="Close contents">
              <X aria-hidden="true" strokeWidth={1.5} />
            </DrawerClose>
          </DrawerHeader>
          <nav aria-label="Mobile article contents">
            {items.map((item) => (
              <DrawerClose
                key={item.id}
                render={<a className={item.depth === 3 ? 'is-nested' : undefined} href={`#${item.id}`} />}
              >
                {item.text}
              </DrawerClose>
            ))}
          </nav>
        </DrawerContent>
      </Drawer>
      <a href="#article-top" aria-label="Back to top"><ArrowUp aria-hidden="true" strokeWidth={1.5} /></a>
    </div>
  );
}
