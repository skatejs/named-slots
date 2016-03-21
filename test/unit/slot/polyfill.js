import create from '../lib/create';
import slotPolyfill from '../../src/slot/polyfill';

describe('slot/polyfill', function () {
  let fallback;
  let slot;

  beforeEach(function () {
    fallback = create('p', ['fallback']);
    slot = create('slot', [fallback]);

    // Ensure it's what we expect before polyfilling.
    expect(slot.firstElementChild).to.equal(fallback, 'before');

    // Polyfill the slot.
    slotPolyfill(slot);
  });

  it('Element.innerHTML', function () {
    expect(slot.innerHTML).to.equal('<p>fallback</p>');
    slot.innerHTML = '<span>default</span>';
    expect(slot.innerHTML).to.equal('<span>default</span>');
  });

  it('Element.outerHTML', function () {
    expect(slot.outerHTML).to.equal('<slot><p>fallback</p></slot>');
  });

  it('Node.appendChild()', function () {
    const newNode = create('div');
    slot.appendChild(newNode);
    expect(slot.childNodes.length).to.equal(2);
    expect(slot.childNodes[0]).to.equal(fallback);
    expect(slot.childNodes[1]).to.equal(newNode);
  });

  it('Node.childNodes', function () {
    expect(slot.childNodes[0]).to.equal(fallback);
  });

  it('Node.firstChild', function () {
    expect(slot.firstChild).to.equal(fallback);
  });

  it('Node.hasChildNodes()', function () {
    expect(slot.hasChildNodes()).to.equal(true);
  });

  it('Node.insertBefore()', function () {
    const newNode = create('div');
    slot.insertBefore(newNode, fallback);
    expect(slot.childNodes.length).to.equal(2);
    expect(slot.childNodes[0]).to.equal(newNode);
    expect(slot.childNodes[1]).to.equal(fallback);
  });

  it('Node.lastChild', function () {
    expect(slot.lastChild).to.equal(fallback);
  });

  it('Node.removeChild()', function () {
    slot.removeChild(fallback);
    expect(slot.hasChildNodes()).to.equal(false);
  });

  it('Node.replaceChild()', function () {
    const newNode = create('div');
    slot.replaceChild(newNode, fallback);
    expect(slot.childNodes.length).to.equal(1);
    expect(slot.childNodes[0]).to.equal(newNode);
  });

  it('Node.textContent', function () {
    expect(slot.textContent).to.equal('fallback');
  });

  it('ParentNode.childElementCount', function () {
    expect(slot.childElementCount).to.equal(1);
  });

  it('ParentNode.children', function () {
    expect(slot.children[0]).to.equal(fallback);
  });

  it('ParentNode.firstElementChild', function () {
    expect(slot.firstElementChild).to.equal(fallback);
  });

  it('ParentNode.lastElementChild', function () {
    expect(slot.lastElementChild).to.equal(fallback);
  });

  it('HTMLSlotElement.getAssignedNodes()', function () {
    expect(slot.getAssignedNodes().childNodes.length).to.equal(0);
  });

  it('HTMLSlotElement.getAssignedNodes({ deep: true })', function () {

  });
});
