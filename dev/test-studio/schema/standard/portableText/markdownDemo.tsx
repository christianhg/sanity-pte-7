import {defineArrayMember, defineField, defineType} from 'sanity'
import {StructuredListsPlugin} from './structuredListsPlugin'

/**
 * Markdown-compliant demo doc for v7 structured-lists spike.
 *
 * Renders `_type: 'list'` as <ul>/<ol> and `_type: 'list-item'` as <li>,
 * with images supported inside list-items as block-objects.
 *
 * The `<StructuredListsPlugin />` registers the two containers via
 * NodePlugin so PTE's render pipeline knows their shape.
 *
 * Spike goal: prove rendering + typing + image editing via Studio's
 * dialog works for this structure.
 */

export const listItem = defineType({
  name: 'list-item',
  title: 'List item',
  type: 'object',
  fields: [
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          lists: [],
        }),
        defineArrayMember({type: 'list'}),
        defineArrayMember({type: 'image'}),
      ],
    }),
  ],
})

export const list = defineType({
  name: 'list',
  title: 'List',
  type: 'object',
  fields: [
    defineField({
      name: 'style',
      title: 'Style',
      type: 'string',
      options: {
        list: [
          {title: 'Bullet', value: 'bullet'},
          {title: 'Number', value: 'number'},
        ],
      },
      initialValue: 'bullet',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [defineArrayMember({type: 'list-item'})],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {items: 'items', style: 'style'},
    prepare({items, style}) {
      const count = items?.length ?? 0
      return {
        title: `${style === 'number' ? 'Numbered' : 'Bullet'} list (${count} item${count === 1 ? '' : 's'})`,
      }
    },
  },
})

export const markdownDemoDocument = defineType({
  name: 'markdownDemo',
  title: 'Markdown Demo (v7 structured lists)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H1', value: 'h1'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
          ],
          lists: [],
        }),
        defineArrayMember({type: 'list'}),
        defineArrayMember({type: 'image'}),
      ],
      components: {
        portableText: {
          plugins: (props) => (
            <>
              {props.renderDefault(props)}
              <StructuredListsPlugin />
            </>
          ),
        },
      },
    }),
  ],
})

export const markdownDemoSchemaTypes = [listItem, list, markdownDemoDocument]
