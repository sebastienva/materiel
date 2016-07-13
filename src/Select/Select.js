// @flow
import React, { Component } from 'react';
import classNames from 'classnames';
import onClickOutside from 'react-onclickoutside';

import Option from '../Option/Option';

type Props = {
  value: ?any,
  multiple: ?boolean,
  onChange: ?() => void,
  children: any,
  label: string,
  noInk: ?boolean, // disable ink animation
}

type State = {
  active: boolean,
  hideAnimation: boolean,
};

class Select extends Component {

  props: Props;
  state: State;

  handleOptionSelected: () => void;

  constructor(props: Object) {
    super(props);

    this.state = {
      active: false,
      hideAnimation: false,
    };
  }

  handleFocus = () => {
    document.body.classList.add('modal-open'); // "lock" the screen
    this.setState({ active: true });
  }

  handleKeyDown = (e) => {
    if (e.keyCode === 9) { // simulate lose of focus when tab is pressed
      this.handleClickOutside();
    }
  }

  handleClickOutside = () => {
    if (this.state.active) {
      this.hideDropdown();
      document.body.classList.remove('modal-open');  // "unlock" the screen
    }
  }

  handleOptionSelected = (val) => {
    let currentVal = this.props.value;

    if (this.props.multiple) {
      const index: number = currentVal.indexOf(val);

      if (index === -1) {
        currentVal.push(val);
      } else {
        currentVal.splice(index, 1);
      }
    } else {
      this.hideDropdown();
      currentVal = val;
    }
    // trigger change
    this.props.onChange(currentVal);
  }

  hideDropdown() {
    // disable dropdown after "hide" animation
    this.setState({ hideAnimation: true });
    setTimeout(() => {
      this.setState({ active: false, hideAnimation: false });
    }, 200);
  }

  isValueSelected(val): boolean {
    let res: boolean;
    if (this.props.multiple && this.props.value) {
      res = this.props.value.indexOf(val) !== -1;
    } else {
      res = this.props.value === val;
    }
    return res;
  }

  addOption(element, options, preview) {
    const optionActive = this.isValueSelected(element.props.value);

    if (optionActive) {
      if (element.props.preview) {
        preview.push(element.props.preview);
      } else {
        preview.push(element.props.children);
      }
    }

    options.push(
      <Option
        onSelect={this.handleOptionSelected}
        key={options.length}
        value={element.props.value}
        active={optionActive}
        multiple={this.props.multiple}
        noInk={this.props.noInk}
      >
        {element.props.children}
      </Option>
    );
  }

  render() {
    // classes
    const dropDownClasses: string = classNames({
      'select-dropdown': true,
      active: this.state.active,
    });
    const dropDownContentClasses: string = classNames({
      'dropdown-content select-dropdown multiple-select-dropdown': true,
      active: this.state.active,
      hideAnimation: this.state.hideAnimation,
    });
    const labelClasses: string = classNames({
      active: this.props.multiple ? this.props.value.length : this.props.value != null,
      'label-field': true,
    });

    // options + preview
    const preview = [];
    let options = [];

    React.Children.map(this.props.children, (child) => {
      if (child.type === 'optgroup') {
        options.push(<li className="optgroup" key={options.length}><span>{child.props.label}</span></li>);
        React.Children.map(child.props.children, (subChild) => {
          this.addOption(subChild, options, preview);
        });
      } else {
        this.addOption(child, options, preview);
      }
    });

    // final render
    return (
      <div className="select-wrapper" onFocus={this.handleFocus.bind(this)} onKeyDown={this.handleKeyDown.bind(this)} >
        <span className="caret">▼</span>
        <label className={labelClasses}>{this.props.label}</label>
        <input type="text" className={dropDownClasses} readOnly value="" />
        <span className="select-preview">
          {preview.map((item) =>
            <span key={item} className="preview-item">{item}</span>
          )}
        </span>
        <ul className={dropDownContentClasses}>
          {options}
        </ul>
      </div>
    );
  }
}

export default onClickOutside(Select);