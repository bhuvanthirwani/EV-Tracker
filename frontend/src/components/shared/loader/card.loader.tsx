import React from 'react';
import {Skeleton} from '@mui/material';

const CardLoader = () => {
	return (
		<div className={'vehicle-card-container'}>
			<div className={'vehicle-card border standard-padding'} style={{paddingLeft: '1vw', paddingRight: '1vw'}}>
				<div className={'flex flex-between'}>
					<Skeleton variant={'text'} width={'40%'}/>
					<div className={'flex flex-center-gap'} style={{width: '25%'}}>
						<Skeleton variant={'text'} width={'45%'}/>
						<Skeleton variant={'text'} width={'45%'}/>
					</div>
				</div>
				<Skeleton variant={'text'}/>
			</div>
		</div>
	);
}

export default CardLoader;
