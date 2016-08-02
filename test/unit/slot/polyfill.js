import '../../../src/index';
import create from '../../lib/create';

describe('slot/polyfill', () => {
  let fallback;
  let slot;

  beforeEach(() => {
    fallback = create('p', ['fallback']);
    slot = create('slot', [fallback]);

    // Ensure it's what we expect before polyfilling.
    expect(slot.firstElementChild).to.equal(fallback, 'before');
  });

  it('Node.appendChild()', () => {
    const newNode = create('div');
    slot.appendChild(newNode);
    expect(slot.childNodes.length).to.equal(2);
    expect(slot.childNodes[0]).to.equal(fallback);
    expect(slot.childNodes[1]).to.equal(newNode);
  });

  it('Node.childNodes', () => {
    expect(slot.childNodes[0]).to.equal(fallback);
  });

  it('Node.firstChild', () => {
    expect(slot.firstChild).to.equal(fallback);
  });

  it('Node.hasChildNodes()', () => {
    expect(slot.hasChildNodes()).to.equal(true);
  });

  it('Node.insertBefore()', () => {
    const newNode = create('div');
    slot.insertBefore(newNode, fallback);
    expect(slot.childNodes.length).to.equal(2);
    expect(slot.childNodes[0]).to.equal(newNode);
    expect(slot.childNodes[1]).to.equal(fallback);
  });

  it('Node.lastChild', () => {
    expect(slot.lastChild).to.equal(fallback);
  });

  it('Node.removeChild()', () => {
    slot.removeChild(fallback);
    expect(slot.hasChildNodes()).to.equal(false);
  });

  it('Node.replaceChild()', () => {
    const newNode = create('div');
    slot.replaceChild(newNode, fallback);
    expect(slot.childNodes.length).to.equal(1);
    expect(slot.childNodes[0]).to.equal(newNode);
  });

  it('Node.textContent', () => {
    expect(slot.textContent).to.equal('fallback');
  });

  it('ParentNode.childElementCount', () => {
    expect(slot.childElementCount).to.equal(1);
  });

  it('ParentNode.children', () => {
    expect(slot.children[0]).to.equal(fallback);
  });

  it('ParentNode.firstElementChild', () => {
    expect(slot.firstElementChild).to.equal(fallback);
  });

  it('ParentNode.lastElementChild', () => {
    expect(slot.lastElementChild).to.equal(fallback);
  });

  it('HTMLSlotElement.assignedNodes()', () => {
    expect(slot.assignedNodes().length).to.equal(0);
  });

  it('HTMLSlotElement.assignedNodes({ deep: true })', () => {

  });

  it('should not slot text nodes that are empty or have only whitespace', () => {
    const host = create('div');
    const root = host.attachShadow({ mode: 'closed' });
    const slot2 = create('slot');
    root.appendChild(slot2);

    host.appendChild(document.createTextNode(''));
    host.appendChild(document.createTextNode(' '));
    host.appendChild(document.createTextNode('\n'));
    host.appendChild(document.createTextNode('testing'));
    expect(slot2.assignedNodes().length).to.equal(4);
    expect(slot2.assignedNodes()[0].textContent).to.equal('');
    expect(slot2.assignedNodes()[1].textContent).to.equal(' ');
    expect(slot2.assignedNodes()[2].textContent).to.equal('\n');
    expect(slot2.assignedNodes()[3].textContent).to.equal('testing');
  });
});
