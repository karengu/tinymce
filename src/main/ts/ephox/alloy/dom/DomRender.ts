import { Arr } from '@ephox/katamari';
import { Attr, Classes, Css, Element, Html, InsertAll, Value } from '@ephox/sugar';

import * as DomDefinition from './DomDefinition';

const getChildren = function (definition) {
  if (definition.domChildren().isSome() && definition.defChildren().isSome()) {
    throw new Error('Cannot specify children and child specs! Must be one or the other.\nDef: ' + DomDefinition.defToStr(definition));
  } else {
    return definition.domChildren().fold(function () {
      const defChildren = definition.defChildren().getOr([ ]);
      return Arr.map(defChildren, renderDef);
    }, function (domChildren) {
      return domChildren;
    });
  }
};

const renderToDom = function (definition) {
  const subject = Element.fromTag(definition.tag());
  Attr.setAll(subject, definition.attributes().getOr({ }));
  Classes.add(subject, definition.classes().getOr([ ]));
  Css.setAll(subject, definition.styles().getOr({ }));
  // Remember: Order of innerHtml vs children is important.
  Html.set(subject, definition.innerHtml().getOr(''));

  // Children are already elements.
  const children = getChildren(definition);
  InsertAll.append(subject, children);

  definition.value().each(function (value) {
    Value.set(subject, value);
  });

  return subject;
};

const renderDef = function (spec) {
  const definition = DomDefinition.nu(spec);
  return renderToDom(definition);
};

export {
  renderToDom
};