import '../styles/ongoing.css'
import useThemeContext from '../context/ThemeContext'
import { useEffect, useState } from 'react';
import useApiContext from '../context/ApiContext';
import { getCurrentSeason, convertTime, removeDuplicates } from '../utilities/utility'
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import PageLoader from '../components/Pageloader'
import { Helmet } from 'react-helmet';

const OngoingPage = () => {
    const [ latestOngoing, setLatestOngoing ] = useState([]);
    const [ data, setData ] = useState([]);
    const { theme } = useThemeContext();
    const { fetchLatestOngoing, fetchInfoOngoing } = useApiContext();

    const currentSeason = getCurrentSeason();
    const currentYear = new Date().getFullYear()

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetchLatestOngoing();
            // console.log('Latest Ongoing', response);
            if (response) {
                setLatestOngoing(response);
            } else {
                setTimeout(() => {
                    fetchData();
                }, 6000)
            }
        }
        fetchData();
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            if (latestOngoing.length === 0) return
            for (const item of latestOngoing) {
                const response = await fetchInfoOngoing(item?.anime?.slug);
                if (
                    response.countryOfOrigin !== 'CN' && 
                    response.season === currentSeason && 
                    response.status === "RELEASING"
                ) 
                    {setData(prevData => removeDuplicates([...prevData, response]));
                }
            }
        }
        fetchData();
    }, [latestOngoing])

    // console.log("Current Ongoing: ", data)

    return (
        <section className='ongoing__page'>
            <Helmet>
                <title>gkanime - Ongoing Anime Series </title>
                <meta 
                    name='description' 
                    content="Find the Ongoing Anime in the current season"
                />
            </Helmet>
            <div className="section__header">
                <h2>
                    Ongoing Anime Series 
                </h2>
            </div>
            {
                data.length <= 3 ? (
                    <PageLoader />
                ) : (
                    <div className="container container__ongoing">
                        <h3>
                            Current Season: {currentSeason} {currentYear}
                        </h3>
                        <div className="ongoing__items">
                            {
                                data.map((item, index) => {
                                    const formattedTime = convertTime(item?.next);
                                    return (
                                        <div key={index} className="ongoing__item">
                                            <div className='ongoing__image'>
                                                <LazyLoadImage 
                                                    effect='blur'
                                                    src={item?.coverImage} 
                                                    alt={item?.title?.romaji || item?.title?.english} 
                                                />
                                                <div className='ongoing__title__studio'>
                                                    <h4>
                                                        <Link to={`/info/${item.id}`}>
                                                            {item.title.romaji || item.title.english}
                                                        </Link>
                                                    </h4>
                                                    {/* <span>
                                                        {item.studios[0]}
                                                    </span> */}
                                                </div>
                                                {   
                                                    item.averageScore >= 70 ? (
                                                        <span className='ongoing__rating'>
                                                            {item.averageScore}%
                                                        </span>
                                                    ) : (
                                                        <span className={`ongoing__rating green ${!item.rating ? 'd-none' : ''}`}>
                                                            {item.averageScore}%
                                                        </span>
                                                    )
                                                }
                                            </div>
                                            <article className='ongoing__article'>
                                                <span className='ongoing__current__ep'>
                                                    EP {item?.currentEpisode + 1} airing in
                                                </span>
                                                <div className='ongoing__countdown'>
                                                    {formattedTime}
                                                </div>
                                                <div className='ongoing__description'>
                                                    <p className=''>
                                                        {item?.description}
                                                    </p>
                                                    <br />
                                                    <Link 
                                                        to={`/info/${item.slug}`}
                                                        className={theme ? 'ligh' : 'dark'}
                                                    >
                                                        Read More
                                                    </Link>
                                                </div>
                                                <ul className='ongoing__genres'>
                                                    {
                                                        item.genre.map((item, index) => {
                                                            return (
                                                                <li key={index}>
                                                                    {item}
                                                                </li>
                                                            )
                                                        })
                                                    }
                                                </ul>
                                            </article>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                )
            }
        </section>
    )
}

export default OngoingPage
