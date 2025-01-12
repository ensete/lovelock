import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { rem } from './StyledUtils';

const StyledLogo = styled(Link)`
  font-size: ${rem(20)};
  display: flex;
  align-items: flex-end;
  text-decoration: none;
  cursor: pointer;
  span {
    margin: ${rem(2)} ${rem(10)};
  }
  &:hover {
    text-decoration: none;
  }
`;
const Title = styled.div`
  font-size: ${rem(20)};
  margin-top: ${rem(15)};
`;

export function HeaderAuthen({ title }) {
  return (
    <div>
      <StyledLogo to="/">
        <img src="/static/img/logo.svg" alt="itea-scan" />
        <span>LoveLock</span>
      </StyledLogo>
      <Title>{title}</Title>
    </div>
  );
}

export function HeaderAuthen2({ title }) {
  return <div>{title}</div>;
}
