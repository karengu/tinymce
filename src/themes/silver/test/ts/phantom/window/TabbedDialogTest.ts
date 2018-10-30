import { ApproxStructure, Assertions, Chain, Mouse, NamedChain, Pipeline, Step, UiFinder } from '@ephox/agar';
import { StructAssert } from '@ephox/agar/lib/main/ts/ephox/agar/assertions/ApproxStructures';
import { UnitTest } from '@ephox/bedrock';
import { Body, Element } from '@ephox/sugar';
import WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';

import { setupDemo } from '../../../../demo/ts/components/DemoHelpers';

UnitTest.asynctest('WindowManager:tabbed-dialog Test', (success, failure) => {
  const helpers = setupDemo();
  const windowManager = WindowManager.setup(helpers.extras);

  const cAssertFormContents = (label: string, f: (s, str, arr) => StructAssert) => {
    return Chain.op((tabview: Element) => {
      Assertions.assertStructure(
        'Checking tabview: ' + label,
        ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            classes: [ arr.has('tox-dialog__body-content') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-form') ],
                children: [
                  s.element('div', {
                    classes: [ arr.has('tox-form__group') ],
                    children: [
                      f(s, str, arr)
                    ]
                  })
                ]
              })
            ]
          });
        }),
        tabview
      );
    });
  };

  NamedChain.direct('tabview', Chain.op((tabview) => {

  }), '_'),

  Pipeline.async({ }, [
    Step.sync(() => {
      windowManager.open({
        title: 'Custom Dialog',
        body: {
          type: 'tabpanel',
          tabs: [
            {
              title: 'Basic',
              items: [
                {
                  name: 'basic1',
                  type: 'input'
                }
              ]
            },
            {
              title: 'Advanced',
              items: [
                {
                  name: 'advanced1',
                  type: 'textarea'
                }
              ]
            }
          ]
        },
        buttons: [
          {
            type: 'custom',
            name: 'gotoBasic',
            text: '-> Basic',
            disabled: false
          },
          {
            type: 'custom',
            name: 'gotoAdvanced',
            text: '-> Advanced',
            disabled: false
          },
          {
            type: 'cancel',
            text: 'cancel'
          },
          {
            type: 'submit',
            text: 'ok'
          }
        ],
        initialData: {
          basic1: 'First tab value',
          advanced1: 'Textarea value'
        },
        onAction: (api, a) => {
          const target = a.name === 'gotoBasic' ? 'Basic' : 'Advanced';
          api.showTab(target);
        },
        onSubmit: () => {

        }
      }, {}, () => {});
    }),

    Chain.asStep({ }, [
      NamedChain.asChain([
        NamedChain.writeValue('page', Body.body()),
        NamedChain.direct('page', UiFinder.cFindIn('[role="dialog"]'), 'dialog'),
        NamedChain.direct('dialog', UiFinder.cFindIn('[role="tab"]:contains("Basic")'), 'basicTab'),
        NamedChain.direct('dialog', UiFinder.cFindIn('[role="tab"]:contains("Advanced")'), 'advancedTab'),
        NamedChain.direct('dialog', UiFinder.cFindIn('[role="tabpanel"]'), 'tabview'),
        NamedChain.direct('dialog', Mouse.cClickOn('button:contains("-> Basic")'), '_'),
        NamedChain.direct('tabview', cAssertFormContents('Clicking Basic button', (s, str, arr) => {
          return s.element('input', {
            value: str.is('First tab value')
          });
        }), '_'),

        NamedChain.direct('dialog', Mouse.cClickOn('button:contains("-> Advanced")'), '_'),
        NamedChain.direct('tabview', cAssertFormContents('Clicking Advanced button (not tab)', (s, str, arr) => {
          return s.element('textarea', {
            value: str.is('Textarea value')
          });
        }), '_'),

        NamedChain.direct('dialog', Mouse.cClickOn('button:contains("-> Basic")'), '_'),
        NamedChain.direct('tabview', cAssertFormContents('Clicking Basic button again (not tab)', (s, str, arr) => {
          return s.element('input', {
            value: str.is('First tab value')
          });
        }), '_'),
      ])
    ])
  ], () => {
    helpers.destroy();
    success();
  }, failure);
});