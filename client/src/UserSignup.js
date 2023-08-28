import React, { useState, useEffect } from 'react'
import Select from 'react-select';
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from './firebase';
import { setDoc, getDoc, collection, doc, getDocs, query, where } from 'firebase/firestore';

export const UserSignup = () => {
    const [teams, setTeams] = useState(null);
    const [data, setData] = useState('');

    useEffect(() => {
        populateSelectTeamMenu()
    }, [])

    const populateSelectTeamMenu = async () => {
        const querySnapshot = await getDocs(collection(db, 'teams'))
        const allTeams = [];
        querySnapshot.forEach((doc) => {
            let fullName = `${doc.data().city} ${doc.data().name}`
            allTeams.push({ value: doc.data().name, label: fullName })
        })
        setTeams(allTeams);
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setData({...data, [name]: value});
    }

    const handleOption = (selectedOption) => {
        setData({ ...data, team: selectedOption.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const checkIfPasswordsMatch = (details) => {
            if (data.teamPassword === details.affiliationPassword) {
                return true
            } else return
        }

        const checkIfTeamPasswordIsCorrect = async (team, credentials) => { 
            const teamQ = query(collection(db, 'teams'), where('name', '==', `${team}`))
            const teamSnap = await getDocs(teamQ)
            teamSnap.forEach(t => {
                if (checkIfPasswordsMatch(t.data()) === true) {
                    setDoc(doc(db, 'users-collection', `${credentials.user.uid}`), {
                        teamAffiliation: (doc(db, `teams/${t.data().uid}`)),
                    }, { merge: true })
                }
            })
        }

        await createUserWithEmailAndPassword(auth, data.email, data.password)
            .then(userCredential => {
                setDoc(doc(db, 'users-collection', `${userCredential.user.uid}`), {
                    uid: userCredential.user.uid,
                    name: data.name,
                })
                checkIfTeamPasswordIsCorrect(data.team, userCredential)
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode, errorMessage);
            })
    }

    return (
        <div id='user-signup-container'>
            <div id='signup-title'>Sign Up</div>
            <form id='user-signup-form'>
                <div className="signup-input-container">
                    <label htmlFor='name'>Name</label>
                    <input type='text' value={data.name === undefined ? '' : data.name} name='name' onChange={(e) => handleChange(e)} maxLength={30} required />
                </div>
                <div className='signup-input-container'>
                    <label htmlFor='email'>Email</label>
                    <input type='email' value={data.email === undefined ? '' : data.email} name='email' onChange={(e) => handleChange(e)} required />
                </div>
                <div className='signup-input-container'>
                    <label htmlFor='password'>Password</label>
                    <input type='password' value={data.password === undefined ? '' : data.password} name='password' onChange={(e) => handleChange(e)} required />
                </div>
                {teams !== null &&
                    <div className='signup-input-container'>
                        <label htmlFor='teamAffiliation'>Team Affiliation</label>
                        <Select name='teamAffiliation' options={teams} onChange={handleOption} />
                    </div>
                }
                {data.team !== undefined &&
                    <div className='signup-input-container'>
                        <label htmlFor='teamPassword'>Team Password</label>
                        <input type='text' value={data.teamPassword === undefined ? '' : data.teamPassword} name='teamPassword' onChange={(e) => handleChange(e)} />
                    </div>
                }
                <button type='submit' className='submit-btn' onClick={(e) => handleSubmit(e)}>Sign Up</button>
            </form>
        </div>
    )
}