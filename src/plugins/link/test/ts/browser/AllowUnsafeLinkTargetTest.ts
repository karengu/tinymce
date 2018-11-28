import '../../../../../themes/silver/main/ts/Theme';

import { Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import LinkPlugin from 'tinymce/plugins/link/Plugin';

import { TestLinkUi } from '../module/TestLinkUi';

UnitTest.asynctest('browser.tinymce.plugins.link.AllowUnsafeLinkTargetTest', (success, failure) => {

  LinkPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      TestLinkUi.sClearHistory,
      Log.stepsAsStep('TBA', 'Link: doesn\'t add rel noopener stuff with allow_unsafe_link_target: true', [
        tinyApis.sSetSetting('allow_unsafe_link_target', true),
        TestLinkUi.sInsertLink('http://www.google.com'),
        TestLinkUi.sAssertContentPresence(tinyApis, { 'a[rel="noopener"]': 0, 'a': 1 }),
        tinyApis.sSetContent('')
      ]),

      Log.stepsAsStep('TBA', 'Link: adds if allow_unsafe_link_target: false', [
        tinyApis.sSetSetting('allow_unsafe_link_target', false),
        TestLinkUi.sInsertLink('http://www.google.com'),
        TestLinkUi.sAssertContentPresence(tinyApis, { 'a[rel="noopener"]': 1 }),
        tinyApis.sSetContent('')
      ]),

      Log.stepsAsStep('TBA', 'Link: ...and if it\'s undefined', [
        tinyApis.sSetSetting('allow_unsafe_link_target', undefined),
        TestLinkUi.sInsertLink('http://www.google.com'),
        TestLinkUi.sAssertContentPresence(tinyApis, { 'a[rel="noopener"]': 1 })
      ]),

      Log.stepsAsStep('TBA', 'Link: allow_unsafe_link_target=false: node filter normalizes and secures rel on SetContent', [
        tinyApis.sSetSetting('allow_unsafe_link_target', false),
        tinyApis.sSetContent('<a href="http://www.google.com" target="_blank" rel="nofollow alternate">Google</a>'),
        tinyApis.sAssertContent('<p><a href="http://www.google.com" target="_blank" rel="alternate nofollow noopener">Google</a></p>'),
        tinyApis.sSetContent('')
      ]),

      Log.stepsAsStep('TBA', 'Link: allow_unsafe_link_target=false: proper option selected for defined rel_list', [
        tinyApis.sSetSetting('allow_unsafe_link_target', false),
        tinyApis.sSetSetting('rel_list', [
          { title: 'Lightbox', value: 'lightbox' },
          { title: 'Test rel', value: 'alternate nofollow' },
          { title: 'Table of contents', value: 'toc' }
        ]),
        tinyApis.sSetContent('<a href="http://www.google.com" target="_blank" rel="nofollow alternate">Google</a>'),
        tinyApis.sSelect('p', [0]),
        TestLinkUi.sOpenLinkDialog,
        TestLinkUi.sAssertDialogContents({
            text: 'Google',
            title: '',
            href: 'http://www.google.com',
            target: '_blank',
            rel: 'alternate nofollow noopener'
        }),
        // Clicking "cancel" here instead of "ok" so that it doesn't fire a pending insert.
        TestLinkUi.sClickCancel
      ]),
      TestLinkUi.sClearHistory
    ], onSuccess, onFailure);
  }, {
    plugins: 'link',
    toolbar: 'link',
    theme: 'silver',
    skin_url: '/project/js/tinymce/skins/oxide',
    target_list: [
      { title: 'New page', value: '_blank' }
    ]
  }, success, failure);
});
