import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import QueueAnim from 'rc-queue-anim';
import { ecc } from '@iceteachain/common';
import { makeStyles } from '@material-ui/core/styles';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import { useSnackbar } from 'notistack';
import CameraAltIcon from '@material-ui/icons/CameraAlt';

import { getAliasAndTags, setTagsInfo, saveFileToIpfs, isAliasRegistered, registerAlias } from '../../../helper';
import { ButtonPro } from '../../elements/Button';
import * as actionGlobal from '../../../store/actions/globalData';
import * as actionAccount from '../../../store/actions/account';
import * as actionCreate from '../../../store/actions/create';
import { DivControlBtnKeystore, FlexBox, LayoutAuthen, BoxAuthen, ShadowBoxAuthen } from '../../elements/StyledUtils';
import { HeaderAuthen } from '../../elements/Common';
import { AvatarPro } from '../../elements';
import ImageCrop from '../../elements/ImageCrop';

const useStyles = makeStyles(() => ({
  avatar: {
    width: 120,
    height: 120,
  },
}));

const BoxAuthenCus = styled(BoxAuthen)`
  top: 30px;
`;

const PreviewContainter = styled.div`
  display: flex;
  flex-direction: row;
  -webkit-box-pack: justify;
  padding: 20px 0 0 0;
  font-size: 14px;
  cursor: pointer;
  .upload_img input[type='file'] {
    font-size: 100px;
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0;
    cursor: pointer;
  }
  .upload_img {
    position: relative;
    overflow: hidden;
    display: inline-block;
    cursor: pointer;
    &:hover .changeImg {
      display: block;
    }
  }

  .changeImg {
    cursor: pointer;
    position: absolute;
    display: none;
    height: 60px;
    bottom: 0;
    top: 60px;
    left: 0;
    right: 0;
    text-align: center;
    background-color: rgba(0, 0, 0, 0.5);
    color: #fff;
    font-size: 80%;
    line-height: 2;
    overflow: hidden;
    border-bottom-left-radius: 600px;
    border-bottom-right-radius: 600px;
  }
  .fileInput {
    width: 100px;
    height: 50px;
    padding: 2px;
    margin: 10px;
    cursor: pointer;
  }
`;

const RightProfile = styled.div`
  padding: 10px;
  margin: 5px;
`;

function ChangeProfile(props) {
  const { setLoading, setAccount, history, address, tokenAddress, tokenKey, setNeedAuth, privateKey } = props;
  const [firstname, setFirstname] = useState({ old: '', new: '' });
  const [lastname, setLastname] = useState({ old: '', new: '' });
  const [avatar, setAvatar] = useState('');
  const [cropFile, setCropFile] = useState('');
  const [username, setUsername] = useState('');
  const [isRegistered, setIsRegistered] = useState(true);
  const [isOpenCrop, setIsOpenCrop] = useState(false);
  const [originFile, setOriginFile] = useState([]);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    getData();
    // Fix issue #148
    ValidatorForm.addValidationRule('specialCharacter', async name => {
      // const regex = new RegExp('^(?=.{3,20}$)(?![_.])(?!.*[_.]{2})[a-z0-9._]+(?<![_.])$');
      const regex = new RegExp('^(?![_.])(?!.*[_.]{2})[a-z0-9._]+[a-z0-9]$');
      return regex.test(name);
    });

    ValidatorForm.addValidationRule('isAliasRegistered', async name => {
      const resp = await isAliasRegistered(name);
      return !resp;
    });

    return () => {
      ValidatorForm.removeValidationRule('isPasswordMatch');
      ValidatorForm.removeValidationRule('isAliasRegistered');
    };
  }, []);

  async function getData() {
    const [alias, tags] = await getAliasAndTags(address);
    if (alias) {
      setIsRegistered(true);
      setUsername(alias);
    } else {
      setIsRegistered(false);
    }

    if (tags) {
      setFirstname({ old: tags.firstname || '', new: tags.firstname || '' });
      setLastname({ old: tags.lastname || '', new: tags.lastname || '' });
      setAvatar(tags.avatar);
    }
  }

  async function saveChange() {
    if (isRegistered ? !tokenKey : !privateKey) {
      setNeedAuth(true);
    } else {
      setLoading(true);
      setTimeout(async () => {
        try {
          const tags = {};
          if (firstname.old !== firstname.new) {
            tags.firstname = firstname.new;
          }

          if (lastname.old !== lastname.new) {
            tags.lastname = lastname.new;
          }

          const displayName = `${firstname.new} ${lastname.new}`;
          if (firstname.old !== firstname.new || lastname.old !== lastname.new) {
            tags['display-name'] = displayName;
          }

          const listSetTags = [];
          const accountInfo = { displayName };
          if (cropFile) {
            const saveAvatar = saveFileToIpfs(cropFile).then(hash => {
              accountInfo.avatar = hash;
              if (avatar !== hash) {
                return setTagsInfo({ avatar: hash }, { address, tokenAddress });
              }
            });
            listSetTags.push(saveAvatar);
          }

          if (!isRegistered) {
            if (privateKey) {
              const { publicKey } = ecc.toPubKeyAndAddress(privateKey);
              tags['pub-key'] = publicKey;
              listSetTags.push(registerAlias(username, address));
            } else {
              const message = 'Please login or Input recovery phrase';
              enqueueSnackbar(message, { variant: 'error' });
              history.push('/login');
            }
          }

          listSetTags.push(setTagsInfo(tags, { address, tokenAddress }));
          const change = await Promise.all(listSetTags);
          if (change) {
            // Set to redux
            setAccount(accountInfo);
            // Show message infor
            const message = 'Change profile success!';
            enqueueSnackbar(message, { variant: 'success' });
            history.push('/');
          }
        } catch (error) {
          console.error(error);
          const message = `An error occurred, please try again later`;
          enqueueSnackbar(message, { variant: 'error' });
        }
        setLoading(false);
      }, 100);
    }
  }

  function handleImageChange(event) {
    event.preventDefault();
    const orFiles = event.target.files;

    if (orFiles.length > 0) {
      setOriginFile(orFiles);
      setIsOpenCrop(true);
    } else {
      setIsOpenCrop(false);
    }
  }

  function closeCrop() {
    setIsOpenCrop(false);
  }

  function acceptCrop(e) {
    closeCrop();
    setCropFile(e.cropFile);
    setAvatar(e.avaPreview);
  }

  const classes = useStyles();

  return (
    <React.Fragment>
      <QueueAnim delay={200} type={['top', 'bottom']}>
        <LayoutAuthen key={1}>
          <BoxAuthenCus>
            <ShadowBoxAuthen>
              <HeaderAuthen title="Change Profile" />
              <ValidatorForm onSubmit={saveChange}>
                <FlexBox>
                  <PreviewContainter>
                    <div className="upload_img">
                      {cropFile ? (
                        <AvatarPro src={avatar} className={classes.avatar} />
                      ) : (
                        <AvatarPro hash={avatar} className={classes.avatar} />
                      )}
                      <div className="changeImg">
                        <input
                          className="fileInput"
                          type="file"
                          onChange={handleImageChange}
                          accept="image/jpeg,image/png"
                        />
                        <CameraAltIcon />
                      </div>
                    </div>
                  </PreviewContainter>
                  <RightProfile>
                    <TextValidator
                      label="Username"
                      fullWidth
                      onChange={event => {
                        // Fix issue #148
                        setUsername(event.currentTarget.value.toLowerCase());
                      }}
                      name="username"
                      validators={
                        isRegistered
                          ? ['required', 'specialCharacter']
                          : ['required', 'specialCharacter', 'isAliasRegistered']
                      }
                      errorMessages={[
                        'This field is required.',
                        'Username cannot contain spaces and special character.',
                        'This username is already taken.',
                      ]}
                      margin="dense"
                      value={username}
                      disabled={isRegistered}
                    />
                    <TextValidator
                      label="First Name"
                      fullWidth
                      onChange={event => setFirstname({ ...firstname, new: event.currentTarget.value })}
                      name="firstname"
                      validators={['required']}
                      errorMessages={['This field is required']}
                      margin="normal"
                      value={firstname.new}
                    />
                    <TextValidator
                      label="Last Name"
                      fullWidth
                      onChange={event => setLastname({ ...lastname, new: event.currentTarget.value })}
                      name="lastname"
                      validators={['required']}
                      errorMessages={['This field is required']}
                      margin="normal"
                      value={lastname.new}
                    />
                  </RightProfile>
                </FlexBox>
                <DivControlBtnKeystore justify="center">
                  <ButtonPro type="submit">Save change</ButtonPro>
                </DivControlBtnKeystore>
              </ValidatorForm>
            </ShadowBoxAuthen>
          </BoxAuthenCus>
        </LayoutAuthen>
      </QueueAnim>
      {isOpenCrop && <ImageCrop close={closeCrop} accept={acceptCrop} originFile={originFile} isChangeProfile />}
    </React.Fragment>
  );
}

const mapStateToProps = state => {
  return {
    address: state.account.address,
    privateKey: state.account.privateKey,
    tokenKey: state.account.tokenKey,
    tokenAddress: state.account.tokenAddress,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setAccount: value => {
      dispatch(actionAccount.setAccount(value));
    },
    setStep: value => {
      dispatch(actionCreate.setStep(value));
    },
    setLoading: value => {
      dispatch(actionGlobal.setLoading(value));
    },
    setNeedAuth: value => {
      dispatch(actionAccount.setNeedAuth(value));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChangeProfile);
